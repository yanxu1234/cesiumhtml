<template>
  <div style="width: 100%">
    <div style="margin: 10px 5px; width: 100%; height: auto">
      <el-button type="primary" @click="onAddItem">新增</el-button>
      <el-button type="primary" @click="toggleSelection()">一键删除</el-button>
      <el-button type="primary">导入</el-button>
      <el-button type="primary">导出</el-button>
      <el-input
        v-model="search"
        placeholder="Please input"
        style="width: 20%;margin-left:10px"
      />
      <el-tag style="margin-left: 5px" size="medium">查询</el-tag>
    </div>
  </div>
  <el-table :data="pagedTableData" style="width: 100%" max-height="465" @selection-change="handleSelectionChange">
    <el-table-column type="selection" width="30" />
    
    <el-table-column fixed prop="id" label="卫星编号" width="80"/>
    <el-table-column prop="name" label="名称" width="80" />
    <el-table-column prop="type" label="任务类型" width="70"/>
    <el-table-column prop="begindate" label="发射时间" width="120"/>
    <el-table-column prop="beginstate" label="发射地" width="80" />
    <el-table-column prop="line1" label="TLE1"   />
    <el-table-column prop="line2" label="TLE2"  />
    <el-table-column prop="condition" label="状态" width="75"/>
    <el-table-column fixed="right" label="操作"  width="125">
      <template #default="scope">
        <el-button size="small" @click="handleEdit(scope.$index)"
          >修改</el-button
        >
        <el-button type="danger" size="small" @click="deleteRow(scope.$index)">
          删除</el-button
        >
      </template>
    </el-table-column>
  </el-table>
  <div style="margin: 10px 5px">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 30, 40]"
      :small="small"
      :disabled="disabled"
      :background="background"
      layout="total, sizes, prev, pager, next, jumper"
      :total="filterTableData.length"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
  <el-dialog
    v-model="dialogadditem"
    title="新增数据"
    width="560"
    style="background-color: #f0f0f0"
  >
    <el-form :model="form">
      <el-row>
        <el-col :span="24">
          <el-form :model="form" :label-width="formLabelWidth" inline>
            <el-form-item label="卫星编号" :label-width="60">
              <el-input
                v-model="form.id"
                autocomplete="off"
                style="width: 80px"
              />
            </el-form-item>
            <el-form-item label="名称" :label-width="60">
              <el-input
                v-model="form.name"
                autocomplete="off"
                style="width: 80px"
              />
            </el-form-item>
              <el-form-item label="发射地" :label-width="60">
              <el-input
                v-model="form.beginstate"
                autocomplete="off"
                style="width: 80px"
              />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-col :span="24">
        <el-form :model="form" :label-width="formLabelWidth" inline>
          <el-form-item label="任务类型" :label-width="60">
            <el-input
              v-model="form.type"
              autocomplete="off"
              style="width: 80px"
            />
          </el-form-item>
          <el-form-item label="状态" :label-width="60">
              <el-input
                v-model="form.condition"
                autocomplete="off"
                style="width: 80px"
              />
            </el-form-item>
        </el-form>
      </el-col>
      
      <el-row>
        <el-col :span="24">
          <el-form :model="form" :label-width="formLabelWidth" inline>
            <el-form-item label="TLE1" :label-width="60">
              <el-input
                v-model="form.line1"
                autocomplete="off"
                style="width: 430px"
              />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form :model="form" :label-width="formLabelWidth" inline>
            <el-form-item label="TLE2" :label-width="60">
              <el-input
                v-model="form.line2"
                autocomplete="off"
                style="width: 430px"
              />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    <el-row>
        <el-col :span="24">
          <el-form :model="form" :label-width="formLabelWidth" inline>
             <el-form-item label="发射时间" :label-width="60">
            <el-input
              v-model="form.begindate"
              autocomplete="off"
              style="width: 200px"
            />
            <el-label style="margin-left: 10px;"> (YYYY-MM-DD HH:mm) </el-label>
          </el-form-item>
          </el-form>
        </el-col>
      </el-row>
     
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogadditem = false">取消</el-button>
        <el-button
          type="primary"
          @click="
            () => {
              confirm();
              dialogadditem = false;
            }
          "
        >
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog
    v-model="dialogupdateitem"
    title="修改数据"
    width="560"
    style="background-color: #f0f0f0"
  >
    <el-form :model="formupdate">
      <el-row>
        <el-col :span="24">
          <el-form :model="formupdate" :label-width="formLabelWidth" inline>
            <el-form-item label="卫星编号" :label-width="60">
              <el-input
                v-model="formupdate.id"
                autocomplete="off"
                style="width: 80px"
              />
            </el-form-item>
            <el-form-item label="名称" :label-width="60">
              <el-input
                v-model="formupdate.name"
                autocomplete="off"
                style="width: 80px"
              />
            </el-form-item>
              <el-form-item label="发射地" :label-width="60">
              <el-input
                v-model="formupdate.beginstate"
                autocomplete="off"
                style="width: 80px"
              />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-col :span="24">
        <el-form :model="formupdate" :label-width="formLabelWidth" inline>
          <el-form-item label="任务类型" :label-width="60">
            <el-input
              v-model="formupdate.type"
              autocomplete="off"
              style="width: 80px"
            />
          </el-form-item>
          <el-form-item label="状态" :label-width="60">
              <el-input
                v-model="formupdate.condition"
                autocomplete="off"
                style="width: 80px"
              />
            </el-form-item>
        </el-form>
      </el-col>
      
      <el-row>
        <el-col :span="24">
          <el-form :model="formupdate" :label-width="formLabelWidth" inline>
            <el-form-item label="TLE1" :label-width="60">
              <el-input
                v-model="formupdate.line1"
                autocomplete="off"
                style="width: 430px"
              />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form :model="formupdate" :label-width="formLabelWidth" inline>
            <el-form-item label="TLE2" :label-width="60">
              <el-input
                v-model="formupdate.line2"
                autocomplete="off"
                style="width: 430px"
              />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form :model="formupdate" :label-width="formLabelWidth" inline>
             <el-form-item label="发射时间" :label-width="60">
            <el-input
              v-model="formupdate.begindate"
              autocomplete="off"
              style="width: 200px"
            />
            <el-label style="margin-left: 10px;"> (YYYY-MM-DD HH:mm) </el-label>
          </el-form-item>
          </el-form>
        </el-col>
      </el-row>
     
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogupdateitem = false">取消</el-button>
        <el-button
          type="primary"
          @click="
            () => {
              confirmupdate();
              dialogupdateitem = false;
            }
          "
        >
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
  <!-- <el-button style="width: 100%" @click="onAddItem">新增</el-button> -->
</template>

<script lang="ts" setup>
import { ref, computed, reactive } from "vue";
import dayjs from "dayjs";
// import { ElTable } from 'element-plus'
const currentPage = ref(1);
const pageSize = ref(10);
const small = ref(true);
const background = ref(false);
const disabled = ref(false);
const selectedRow = ref();//要未定义 不能把对象直接赋值给对象
const formLabelWidth = "450px";
const dialogadditem = ref(false);
const dialogupdateitem = ref(false);
//  const selectedItems = ref([]); // 存储被选中项的数组
const form = reactive({
  id: "",
  name: "",
  type: "",
  begindate: "",
  beginstate: "",
  line1: "",
  line2: "",
  condition: "",
});
const formupdate= reactive({
  id: "",
  name: "",
  type: "",
  begindate: "",
  beginstate: "",
  line1: "",
  line2: "",
  condition: "",
});
const tableData = ref([
  {
    id: "s001",
    name: "麒麟2号",
    type: "导航",
    begindate: "2024-04-02 09:32",
    beginstate: "酒泉",
    line1: "1 04382U 70034A   24115.82287935  .00002399  00000-0  35241-3 0  9999",
    line2: "2 04382  68.4217 216.4594 1041497 324.7403  28.8816 13.10878190542852",
    condition: "正常",
  },
  {
    id: "s002",
    name: "天地2号",
    type: "天气",
    begindate: "2024-05-02 09:32",
    beginstate: "文昌",
    line1: "1 04400U 70034  C 83083.63882951  .70920659 +21564-4 +15010-2 0  9995",
    line2: "2 04400 068.4206 158.6220 0013952 341.7442 018.2810 16.45622328628460",
    condition: "正常",
  },{
    id: "s003",
    name: "电信1号",
    type: "通信",
    begindate: "2024-04-02 09:32",
    beginstate: "酒泉",
    line1: "1 04382U 70034A   24115.82287935  .00002399  00000-0  35241-3 0  9999",
    line2: "2 04382  68.4217 216.4594 1041497 324.7403  28.8816 13.10878190542852",
    condition: "维护",
  },{
    id: "s004",
    name: "红外3号",
    type: "遥感",
    begindate: "2024-04-02 09:32",
    beginstate: "合肥",
    line1: "1 04382U 70034A   24115.82287935  .00002399  00000-0  35241-3 0  9999",
    line2: "2 04382  68.4217 216.4594 1041497 324.7403  28.8816 13.10878190542852",
    condition: "在轨运行",
  },{
    id: "s005",
    name: "东风2号",
    type: "军事",
    begindate: "2024-07-02 09:32",
    beginstate: "喀什",
    line1: "1 04382U 70034A   24115.82287935  .00002399  00000-0  35241-3 0  9999",
    line2: "2 04382  68.4217 216.4594 1041497 324.7403  28.8816 13.10878190542852",
    condition: "等待发射",
  },{
    id: "s006",
    name: "启航5号",
    type: "教育",
    begindate: "2024-06-01 09:32",
    beginstate: "南京",
    line1: "1 04382U 70034A   24115.82287935  .00002399  00000-0  35241-3 0  9999",
    line2: "2 04382  68.4217 216.4594 1041497 324.7403  28.8816 13.10878190542852",
    condition: "等待发射",
  },{
    id: "s007",
    name: "麒麟2号",
    type: "导航",
    begindate: "2024-04-02 09:32",
    beginstate: "酒泉",
    line1: "1 04382U 70034A   24115.82287935  .00002399  00000-0  35241-3 0  9999",
    line2: "2 04382  68.4217 216.4594 1041497 324.7403  28.8816 13.10878190542852",
    condition: "正常",
  },{
    id: "s008",
    name: "麒麟2号",
    type: "导航",
    begindate: "2024-04-02 09:32",
    beginstate: "酒泉",
    line1: "1 04382U 70034A   24115.82287935  .00002399  00000-0  35241-3 0  9999",
    line2: "2 04382  68.4217 216.4594 1041497 324.7403  28.8816 13.10878190542852",
    condition: "正常",
  },{
    id: "s009",
    name: "麒麟2号",
    type: "导航",
    begindate: "2024-04-02 09:32",
    beginstate: "酒泉",
    line1: "1 04382U 70034A   24115.82287935  .00002399  00000-0  35241-3 0  9999",
    line2: "2 04382  68.4217 216.4594 1041497 324.7403  28.8816 13.10878190542852",
    condition: "正常",
  },{
    id: "s010",
    name: "麒麟2号",
    type: "导航",
    begindate: "2024-04-02 09:32",
    beginstate: "酒泉",
    line1: "1 04382U 70034A   24115.82287935  .00002399  00000-0  35241-3 0  9999",
    line2: "2 04382  68.4217 216.4594 1041497 324.7403  28.8816 13.10878190542852",
    condition: "正常",
  },{
    id: "s011",
    name: "麒麟2号",
    type: "导航",
    begindate: "2024-04-02 09:32",
    beginstate: "酒泉",
    line1: "1 04382U 70034A   24115.82287935  .00002399  00000-0  35241-3 0  9999",
    line2: "2 04382  68.4217 216.4594 1041497 324.7403  28.8816 13.10878190542852",
    condition: "正常",
  },{
    id: "s012",
    name: "麒麟2号",
    type: "导航",
    begindate: "2024-04-02 09:32",
    beginstate: "酒泉",
    line1: "1 04382U 70034A   24115.82287935  .00002399  00000-0  35241-3 0  9999",
    line2: "2 04382  68.4217 216.4594 1041497 324.7403  28.8816 13.10878190542852",
    condition: "正常",
  },
]);
const handleEdit = (index: number) => {
  //   tableData.value.splice(index, 1)
  dialogupdateitem.value = true;
  selectedRow.value = tableData.value[index];
  const {
    id,
    name,
    type,
    begindate,
    beginstate,
    line1,
    line2,
    condition,
  } = selectedRow.value;
  formupdate.id = id;
  formupdate.name = name;
  formupdate.type = type;
  formupdate.begindate = begindate;
  formupdate.beginstate = beginstate;
  formupdate.line1 = line1;
  formupdate.line2 = line2;
  formupdate.condition = condition;
};

const deleteRow = (index: number) => {
  tableData.value.splice(index, 1);
};

const search = ref("");
// const filterTableData = computed(() =>
//   tableData.value.filter(
//     (data) =>
//       !search.value ||
//       data.id.toLowerCase().includes(search.value.toLowerCase())
//   )
// );
const filterTableData = computed(() =>
  tableData.value.filter((data) => {
    const searchString = search.value.toLowerCase();
    return Object.values(data).some((value) =>
      value.toString().toLowerCase().includes(searchString)
    );
  })
);
const pagedTableData = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filterTableData.value.slice(startIndex, endIndex);
});
const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`);
};
const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`);
};
const onAddItem = () => {
  dialogadditem.value = true;
};
const selectedRows = ref([]); // 存储已勾选行的索引数组
const handleSelectionChange = (rows) => {
      selectedRows.value = rows;
    };
const toggleSelection = () => {//删除所有勾选的行
    selectedRows.value.forEach((row) => {
        const index = tableData.value.indexOf(row);
        if (index !== -1) {
          tableData.value.splice(index, 1);
        }
      });
      selectedRows.value = [];
};
const confirm = () => {
  tableData.value.push({
    id: form.id,
    name: form.name,
    type: form.type,
    begindate: form.begindate,
    beginstate: form.beginstate,
    line1: form.line1,
    line2: form.line2,
    condition: form.condition,
  });
 
  
};
const confirmupdate = () => {
  selectedRow.value.id = formupdate.id;
  selectedRow.value.name = formupdate.name;
  selectedRow.value.type = formupdate.type;
  selectedRow.value.begindate = formupdate.begindate;
  selectedRow.value.beginstate = formupdate.beginstate;
  selectedRow.value.line1 = formupdate.line1;
  selectedRow.value.line2 = formupdate.line2;
  selectedRow.value.condition = formupdate.condition;
};
</script>
