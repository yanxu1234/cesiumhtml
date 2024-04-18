<template>
    <div style="width: 100%;">
        <div style="margin: 10px 5px; width: 100%; height: auto;">
    <el-button type="primary">新增</el-button>
    <el-button type="primary">导入</el-button>
    <el-button type="primary">导出</el-button>
  </div>
  <div style="margin: 10px 5px;">
    <el-input v-model="search" placeholder="Please input" style="width: 20%;"/>
    <el-button style="margin-left: 5px;" type="primary">查询</el-button>
  </div>
    </div>
  <el-table :data="tableData" style="width: 100%" max-height="465" >
        <el-table-column type="selection" width="55" />
    <el-table-column fixed prop="date" label="Date" />
    <el-table-column prop="name" label="Name" />
    <el-table-column prop="state" label="State" />
    <el-table-column prop="city" label="City"  />
    <el-table-column prop="address" label="Address"  />
    <el-table-column prop="zip" label="Zip" />
    <el-table-column fixed="right" label="操作">
      <template #default="scope">
        <el-button size="small"
        @click="handleEdit(scope.$index)"
          >Edit</el-button
        >
       
         <el-popconfirm title="确认删除吗?">
    <template #reference>
       <el-button
          type="danger"
          size="small"
          @click.prevent="deleteRow(scope.$index)"
        >
          删除
        </el-button>
    </template>
  </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>

    <div style="margin: 10px 5px;">
    <el-pagination
      v-model:current-page="currentPage4"
      v-model:page-size="pageSize4"
      :page-sizes="[100, 200, 300, 400]"
      :small="small"
      :disabled="disabled"
      :background="background"
      layout="total, sizes, prev, pager, next, jumper"
      :total="400"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>

  <el-button  style="width: 100%" @click="onAddItem"
    >Add Item</el-button
  >
   <!-- <el-button @click="toggleSelection()">Clear selection</el-button> -->
</template>

<script lang="ts" setup>
import { ref,computed} from 'vue'
import dayjs from 'dayjs'
// import { ElTable } from 'element-plus'
const currentPage1 = ref(5)
const currentPage2 = ref(5)
const currentPage3 = ref(5)
const currentPage4 = ref(1)

const pageSize2 = ref(100)
const pageSize3 = ref(100)
const pageSize4 = ref(100)
const small = ref(true)
const background = ref(false)
const disabled = ref(false)

const now = new Date()
const tableData = ref([
  {
    date: '2016-05-01',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  },
  {
    date: '2016-05-03',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  },
])
const handleEdit = (index: number) => {
//   tableData.value.splice(index, 1)
}

const deleteRow = (index: number) => {
  tableData.value.splice(index, 1)
}

const search = ref('')
const filterTableData = computed(() =>
  tableData.value.filter(
    (data) =>
      !search.value ||
      data.name.toLowerCase().includes(search.value.toLowerCase())
  )
)
const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`)
}
const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`)
}
const onAddItem = () => {
  now.setDate(now.getDate() + 1)
  tableData.value.push({
    date: dayjs(now).format('YYYY-MM-DD'),
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  })
}

const toggleSelection = () => {

}


</script>
