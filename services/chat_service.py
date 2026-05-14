import json
import re
from collections import Counter
from datetime import datetime
from models import ChatSession, ChatMessage, Book, BookCategory, BookView, Course, Favorite, User, db
from utils import model_to_dict, generate_id


class ChatService:
    SINGLE_CHAR_BOOK_TERMS = {'C', 'R'}

    BOOK_STOP_WORDS = [
        '推荐', '找书', '买书', '购书', '书籍', '教材', '书', '有什么', '哪些',
        '有没有', '有吗', '需要', '想要', '想买', '想学', '帮我', '给我',
        '几本', '一本', '一些', '一下', '相关', '适合', '可以', '吗', '呢',
        '入门', '基础', '专业', '课程', '考研', '考试', '复习', '资料',
        '的', '了', '和', '或', '以及', '请'
    ]

    @staticmethod
    def get_or_create_session(user_id):
        """获取或创建用户的当前会话"""
        # 获取用户最近的会话
        session = ChatSession.query.filter_by(user_id=user_id).order_by(
            ChatSession.last_message_time.desc()
        ).first()
        
        # 如果没有会话或最近的会话消息数超过50条，创建新会话
        if not session or session.message_count >= 50:
            session = ChatSession(
                id=generate_id(),
                user_id=user_id,
                title='新对话',
                message_count=0,
                last_message_time=datetime.now()
            )
            db.session.add(session)
            db.session.commit()
        
        return session

    @staticmethod
    def get_session_list(user_id, limit=10):
        """获取用户的会话列表"""
        sessions = ChatSession.query.filter_by(user_id=user_id).order_by(
            ChatSession.last_message_time.desc()
        ).limit(limit).all()
        
        result = []
        for session in sessions:
            data = model_to_dict(session)
            # 获取第一条消息作为预览
            first_msg = ChatMessage.query.filter_by(
                session_id=session.id, role='user'
            ).first()
            data['preview'] = first_msg.content[:50] if first_msg else '新对话'
            result.append(data)
        
        return result

    @staticmethod
    def get_session_messages(session_id, user_id):
        """获取会话的所有消息"""
        # 验证会话属于该用户
        session = ChatSession.query.filter_by(id=session_id, user_id=user_id).first()
        if not session:
            return None
        
        messages = ChatMessage.query.filter_by(session_id=session_id).order_by(
            ChatMessage.addtime.asc()
        ).all()
        
        result = []
        for msg in messages:
            data = model_to_dict(msg)
            # 解析extra_data
            if msg.extra_data:
                try:
                    data['metadata'] = json.loads(msg.extra_data)
                except:
                    data['metadata'] = {}
            result.append(data)
        
        return result

    @staticmethod
    def save_message(session_id, role, content, content_type='text', metadata=None):
        """保存消息"""
        message = ChatMessage(
            id=generate_id(),
            session_id=session_id,
            role=role,
            content=content,
            content_type=content_type,
            extra_data=json.dumps(metadata) if metadata else None
        )
        db.session.add(message)
        
        # 更新会话信息
        session = ChatSession.query.get(session_id)
        if session:
            session.message_count = session.message_count + 1
            session.last_message_time = datetime.now()
            
            # 如果是第一条用户消息，用它作为会话标题
            if session.message_count == 1 and role == 'user':
                session.title = content[:30] + ('...' if len(content) > 30 else '')
        
        db.session.commit()
        return model_to_dict(message)

    @staticmethod
    def create_session(user_id, title='新对话'):
        """创建新会话"""
        session = ChatSession(
            id=generate_id(),
            user_id=user_id,
            title=title,
            message_count=0,
            last_message_time=datetime.now()
        )
        db.session.add(session)
        db.session.commit()
        return model_to_dict(session)

    @staticmethod
    def delete_session(session_id, user_id):
        """删除会话"""
        session = ChatSession.query.filter_by(id=session_id, user_id=user_id).first()
        if not session:
            return False
        
        # 删除会话会级联删除所有消息
        db.session.delete(session)
        db.session.commit()
        return True

    @staticmethod
    def extract_book_terms(text):
        """从自然语言中提取用于书籍检索的关键词。"""
        if not text:
            return []

        normalized = re.sub(r'[^\w\u4e00-\u9fff+#.]+', ' ', text)
        for word in ChatService.BOOK_STOP_WORDS:
            normalized = normalized.replace(word, ' ')
        terms = []
        for term in normalized.split():
            term = term.strip()
            if ChatService._is_valid_book_term(term):
                terms.append(term)
                terms.extend(re.findall(r'[A-Za-z0-9][A-Za-z0-9+#.]*', term))

        return ChatService._unique_terms(terms)

    @staticmethod
    def search_books_for_ai(query, limit=5, user_id=None):
        """为AI搜索平台书籍，支持多关键词和分类/出版社匹配。"""
        terms = query if isinstance(query, list) else [query, *ChatService.extract_book_terms(query)]
        books = ChatService._search_book_models(terms, limit=limit * 8, user_id=user_id)
        return ChatService._format_books(books[:limit])

    @staticmethod
    def _is_valid_book_term(term):
        if not term or term in ChatService.BOOK_STOP_WORDS:
            return False
        return len(term) >= 2 or term.upper() in ChatService.SINGLE_CHAR_BOOK_TERMS

    @staticmethod
    def get_profile_recommendations(user_id, limit=5):
        """根据用户专业、课程、浏览和收藏偏好推荐平台书籍。"""
        user = User.query.get(user_id)
        preferred_terms = []
        preferred_category_ids = []
        exclude_ids = set()

        if user:
            if user.major and user.major.name:
                preferred_terms.append(user.major.name)
            if user.college and user.college.name:
                preferred_terms.append(user.college.name)
            if user.grade:
                preferred_terms.append(user.grade)
            if user.major_id:
                courses = Course.query.filter_by(major_id=user.major_id).limit(8).all()
                preferred_terms.extend(course.name for course in courses if course.name)

        activity_rows = []
        activity_rows.extend(
            Favorite.query.filter_by(user_id=user_id).order_by(Favorite.addtime.desc()).limit(20).all()
        )
        activity_rows.extend(
            BookView.query.filter_by(user_id=user_id).order_by(BookView.view_time.desc()).limit(20).all()
        )
        activity_ids = [row.book_id for row in activity_rows if row.book_id]
        exclude_ids.update(activity_ids)

        if activity_ids:
            activity_books = Book.query.filter(Book.id.in_(activity_ids)).all()
            category_counts = Counter(book.category_id for book in activity_books if book.category_id)
            preferred_category_ids = [cid for cid, _ in category_counts.most_common(5)]
            preferred_terms.extend(book.category.name for book in activity_books if book.category)
            preferred_terms.extend(book.author for book in activity_books if book.author)

        preferred_terms = ChatService._unique_terms(preferred_terms)
        candidates = []

        if preferred_category_ids:
            query = Book.query.filter(Book.status == 1, Book.stock > 0, Book.category_id.in_(preferred_category_ids))
            if exclude_ids:
                query = query.filter(~Book.id.in_(exclude_ids))
            if user_id:
                query = query.filter(Book.seller_id != user_id)
            candidates.extend(query.order_by(Book.addtime.desc()).limit(limit * 4).all())

        candidates.extend(
            ChatService._search_book_models(
                preferred_terms,
                limit=limit * 6,
                user_id=user_id,
                exclude_ids=exclude_ids,
                preferred_category_ids=preferred_category_ids,
            )
        )

        if len(candidates) < limit:
            fallback = Book.query.filter(Book.status == 1, Book.stock > 0)
            if user_id:
                fallback = fallback.filter(Book.seller_id != user_id)
            if exclude_ids:
                fallback = fallback.filter(~Book.id.in_(exclude_ids))
            candidates.extend(fallback.order_by(Book.addtime.desc()).limit(limit * 3).all())

        ranked = ChatService._rank_books(candidates, preferred_terms, preferred_category_ids)
        return ChatService._format_books(ranked[:limit])

    @staticmethod
    def _search_book_models(terms, limit=40, user_id=None, exclude_ids=None, preferred_category_ids=None):
        terms = ChatService._unique_terms(terms)
        if not terms:
            return []

        filters = []
        for term in terms:
            like = f'%{term}%'
            filters.extend([
                Book.title.like(like),
                Book.author.like(like),
                Book.publisher.like(like),
                Book.isbn.like(like),
                Book.description.like(like),
                Book.category.has(BookCategory.name.like(like)),
            ])

        query = Book.query.filter(Book.status == 1, Book.stock > 0, db.or_(*filters))
        if user_id:
            query = query.filter(Book.seller_id != user_id)
        if exclude_ids:
            query = query.filter(~Book.id.in_(exclude_ids))

        books = query.order_by(Book.addtime.desc()).limit(limit).all()
        return ChatService._rank_books(books, terms, preferred_category_ids)

    @staticmethod
    def _rank_books(books, terms=None, preferred_category_ids=None):
        terms = terms or []
        preferred_category_ids = set(preferred_category_ids or [])
        unique = {}
        for book in books:
            if book and book.id not in unique:
                unique[book.id] = book

        def score(book):
            value = 0
            title = book.title or ''
            author = book.author or ''
            publisher = book.publisher or ''
            description = book.description or ''
            category = book.category.name if book.category else ''
            for term in terms:
                if term in title:
                    value += 12
                if term in category:
                    value += 9
                if term in author:
                    value += 6
                if term in publisher:
                    value += 4
                if term in description:
                    value += 2
            if book.category_id in preferred_category_ids:
                value += 8
            if book.stock and book.stock > 0:
                value += 3
            return value

        return sorted(unique.values(), key=lambda item: (score(item), item.addtime or datetime.min), reverse=True)

    @staticmethod
    def _format_books(books):
        result = []
        for book in books:
            result.append({
                'id': book.id,
                'title': book.title,
                'author': book.author,
                'cover': book.cover,
                'price': float(book.price) if book.price else 0,
                'original_price': float(book.original_price) if book.original_price else 0,
                'stock': book.stock,
                'condition': book.condition.name if book.condition else '',
                'category': book.category.name if book.category else ''
            })
        return result

    @staticmethod
    def _unique_terms(terms):
        result = []
        seen = set()
        for term in terms or []:
            term = str(term or '').strip()
            if term in seen or not ChatService._is_valid_book_term(term):
                continue
            seen.add(term)
            result.append(term)
        return result

    @staticmethod
    def format_book_recommendation(books):
        """格式化书籍推荐为富文本"""
        if not books:
            return None
        
        return {
            'type': 'book_list',
            'books': books
        }
