<template>
  <div>
    <el-card>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="评论内容"><el-input v-model="searchForm.content" placeholder="请输入评论内容" clearable /></el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="searchForm.content = ''; loadData()">重置</el-button>
          <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" @selection-change="sel => selectedIds = sel.map(r=>r.id)" border stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="user_name" label="用户名" min-width="120" />
        <el-table-column prop="book_title" label="书籍名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="rating" label="评分" width="100">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled show-score text-color="#ff9900" />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评论内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="reply" label="回复内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="addtime" label="评论时间" width="180">
          <template #default="{ row }">
            {{ row.addtime ? new Date(row.addtime).toLocaleString('zh-CN') : '' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openReply(row)">回复</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination style="margin-top:16px;justify-content:flex-end" v-model:current-page="page"
        v-model:page-size="limit" :total="total" :page-sizes="[10,20,50]"
        layout="total, sizes, prev, pager, next" @change="loadData" />
    </el-card>
    <el-dialog v-model="dialogVisible" title="回复评论" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="评论内容"><el-input :model-value="form.content" disabled type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="回复内容"><el-input v-model="form.reply" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '@/utils/http'

const searchForm = reactive({ content: '' })
const tableData = ref([]); const page = ref(1); const limit = ref(10); const total = ref(0)
const dialogVisible = ref(false); const form = ref({}); const selectedIds = ref([])

const loadData = async () => {
  const { data: res } = await http.get('/review/page', { params: { ...searchForm, page: page.value, limit: limit.value } })
  if (res.code === 0) { tableData.value = res.data.list; total.value = res.data.total }
}
const openReply = (row) => { form.value = { ...row }; dialogVisible.value = true }
const handleSave = async () => {
  const { data: res } = await http.post('/review/reply', { id: form.value.id, reply: form.value.reply })
  if (res.code === 0) { ElMessage.success('回复成功'); dialogVisible.value = false; loadData() } else ElMessage.error(res.msg)
}
const handleDelete = async (id) => { await ElMessageBox.confirm('确定删除？'); const { data: res } = await http.post('/review/delete', [id]); if (res.code === 0) { ElMessage.success('删除成功'); loadData() } }
const handleBatchDelete = async () => {
  if (!selectedIds.value.length) return ElMessage.warning('请选择数据')
  await ElMessageBox.confirm(`确定删除${selectedIds.value.length}条？`); const { data: res } = await http.post('/review/delete', selectedIds.value); if (res.code === 0) { ElMessage.success('删除成功'); loadData() }
}
onMounted(loadData)
</script>
