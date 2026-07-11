<template>
  <div>
    <el-card>
      <el-form :inline="true">
        <el-form-item>
          <el-button type="success" @click="openDialog()">新增</el-button>
          <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" @selection-change="sel => selectedIds = sel.map(r=>r.id)" border stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="subtitle" label="副标题" />
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column prop="addtime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination style="margin-top:16px;justify-content:flex-end" v-model:current-page="page"
        v-model:page-size="limit" :total="total" :page-sizes="[10,20,50]"
        layout="total, sizes, prev, pager, next" @change="loadData" />
    </el-card>
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑' : '新增'" width="700px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="副标题"><el-input v-model="form.subtitle" /></el-form-item>
        <el-form-item label="内容"><el-input v-model="form.content" type="textarea" :rows="6" /></el-form-item>
        <el-form-item label="图片1"><FileUpload v-model="form.picture1" /></el-form-item>
        <el-form-item label="图片2"><FileUpload v-model="form.picture2" /></el-form-item>
        <el-form-item label="图片3"><FileUpload v-model="form.picture3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '@/utils/http'
import FileUpload from '@/components/FileUpload.vue'

const tableData = ref([]); const page = ref(1); const limit = ref(10); const total = ref(0)
const dialogVisible = ref(false); const isEdit = ref(false); const form = ref({}); const selectedIds = ref([])

const loadData = async () => {
  const { data: res } = await http.get('/aboutus/page', { params: { page: page.value, limit: limit.value } })
  if (res.code === 0) { tableData.value = res.data.list; total.value = res.data.total }
}
const openDialog = (row) => { isEdit.value = !!row; form.value = row ? { ...row } : {}; dialogVisible.value = true }
const handleSave = async () => {
  const { data: res } = await http.post(isEdit.value ? '/aboutus/update' : '/aboutus/save', form.value)
  if (res.code === 0) { ElMessage.success('操作成功'); dialogVisible.value = false; loadData() } else ElMessage.error(res.msg)
}
const handleDelete = async (id) => { await ElMessageBox.confirm('确定删除？'); const { data: res } = await http.post('/aboutus/delete', [id]); if (res.code === 0) { ElMessage.success('删除成功'); loadData() } }
const handleBatchDelete = async () => {
  if (!selectedIds.value.length) return ElMessage.warning('请选择数据')
  await ElMessageBox.confirm(`确定删除${selectedIds.value.length}条？`); const { data: res } = await http.post('/aboutus/delete', selectedIds.value); if (res.code === 0) { ElMessage.success('删除成功'); loadData() }
}
onMounted(loadData)
</script>
