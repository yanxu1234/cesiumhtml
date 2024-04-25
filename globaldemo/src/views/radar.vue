<template>
  <div style="width: 100%">
    <div style="margin: 10px 5px; width: 100%; height: auto">
      <el-button type="primary" @click="onAddItem">新增</el-button>
      <el-button type="primary" @click="toggleSelection()">一键删除</el-button>
      <el-button type="primary">导入</el-button>
      <el-button type="primary">导出</el-button>
    </div>
    <div style="margin: 10px 5px">
      <el-input
        v-model="search"
        placeholder="Please input"
        style="width: 20%"
      />
      <el-tag style="margin-left: 5px" size="medium">查询</el-tag>
    </div>
  </div>
  <el-table
    :data="pagedTableData"
    style="width: 100%"
    max-height="465"
    @selection-change="handleSelectionChange"
  >
    <el-table-column type="selection" width="55" />
    <el-table-column fixed prop="id" label="设备ID" />
    <el-table-column prop="name" label="站点名称" />
    <el-table-column prop="type" label="设备类型" />
    <el-table-column prop="location" label="位置坐标" />
    <el-table-column prop="beamwidth" label="波束宽度" />
    <el-table-column prop="distance" label="探测距离" />
    <el-table-column prop="targettype" label="目标类型" />
    <el-table-column prop="scanmodel" label="扫描模式" />
    <el-table-column prop="frequency" label="频率" />
    <!-- <el-table-column prop="time" label="采集时间" /> -->
    <el-table-column fixed="right" label="操作" width="200">
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
    width="400"
    style="background-color: #f0f0f0"
  >
    <el-form :model="form">
      <el-row>
        <el-col :span="24">
          <el-form :model="form" :label-width="formLabelWidth" inline>
            <el-form-item label="设备ID" :label-width="60">
              <el-input
                v-model="form.id"
                autocomplete="off"
                style="width: 80px"
              />
            </el-form-item>
            <el-form-item label="设备类型" :label-width="60">
              <el-input
                v-model="form.type"
                autocomplete="off"
                style="width: 80px"
              />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-col :span="24">
        <el-form :model="form" :label-width="formLabelWidth" inline>
          <el-form-item label="站点名称" :label-width="60">
            <el-input
              v-model="form.name"
              autocomplete="off"
              style="width: 80px"
            />
          </el-form-item>
          <el-form-item label="频率" :label-width="60">
            <el-input
              v-model="form.frequency"
              autocomplete="off"
              style="width: 80px"
            />
          </el-form-item>
        </el-form>
      </el-col>
      <el-row>
        <el-col :span="24">
          <el-form :model="form" :label-width="formLabelWidth" inline>
            <el-form-item label="波束宽度" :label-width="60">
              <el-input
                v-model="form.beamwidth"
                autocomplete="off"
                style="width: 80px"
              />
            </el-form-item>
            <el-form-item label="探测距离" :label-width="60">
              <el-input
                v-model="form.distance"
                autocomplete="off"
                style="width: 80px"
              />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form :model="form" :label-width="formLabelWidth" inline>
            <el-form-item label="目标类型" :label-width="60">
              <el-input
                v-model="form.targettype"
                autocomplete="off"
                style="width: 80px"
              />
            </el-form-item>
            <el-form-item label="扫描模式" :label-width="60">
              <el-input
                v-model="form.scanmodel"
                autocomplete="off"
                style="width: 80px"
              />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form :model="form" :label-width="formLabelWidth" inline>
            <el-form-item label="位置坐标" :label-width="60">
              <el-input
                v-model="form.location"
                autocomplete="off"
                style="width: 200px"
              />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row> </el-row>
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
    width="400"
    style="background-color: #f0f0f0"
  >
    <el-form :model="formupdate">
      <el-row>
        <el-col :span="24">
          <el-form :model="formupdate" :label-width="formLabelWidth" inline>
            <el-form-item label="设备ID" :label-width="60">
              <el-input
                v-model="formupdate.id"
                autocomplete="off"
                style="width: 80px"
              />
            </el-form-item>
            <el-form-item label="设备类型" :label-width="60">
              <el-input
                v-model="formupdate.type"
                autocomplete="off"
                style="width: 80px"
              />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-col :span="24">
        <el-form :model="formupdate" :label-width="formLabelWidth" inline>
          <el-form-item label="站点名称" :label-width="60">
            <el-input
              v-model="formupdate.name"
              autocomplete="off"
              style="width: 80px"
            />
          </el-form-item>
          <el-form-item label="频率" :label-width="60">
            <el-input
              v-model="formupdate.frequency"
              autocomplete="off"
              style="width: 80px"
            />
          </el-form-item>
        </el-form>
      </el-col>
      <el-row>
        <el-col :span="24">
          <el-form :model="formupdate" :label-width="formLabelWidth" inline>
            <el-form-item label="波束宽度" :label-width="60">
              <el-input
                v-model="formupdate.beamwidth"
                autocomplete="off"
                style="width: 80px"
              />
            </el-form-item>
            <el-form-item label="探测距离" :label-width="60">
              <el-input
                v-model="formupdate.distance"
                autocomplete="off"
                style="width: 80px"
              />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form :model="formupdate" :label-width="formLabelWidth" inline>
            <el-form-item label="目标类型" :label-width="60">
              <el-input
                v-model="formupdate.targettype"
                autocomplete="off"
                style="width: 80px"
              />
            </el-form-item>
            <el-form-item label="扫描模式" :label-width="60">
              <el-input
                v-model="formupdate.scanmodel"
                autocomplete="off"
                style="width: 80px"
              />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form :model="formupdate" :label-width="formLabelWidth" inline>
            <el-form-item label="位置坐标" :label-width="60">
              <el-input
                v-model="formupdate.location"
                autocomplete="off"
                style="width: 200px"
              />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row> </el-row>
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
const selectedRow = ref(); //要未定义 不能把对象直接赋值给对象
const formLabelWidth = "450px";
const dialogadditem = ref(false);
const dialogupdateitem = ref(false);
//  const selectedItems = ref([]); // 存储被选中项的数组
const form = reactive({
  id: "",
  name: "",
  type: "",
  location: "",
  beamwidth: "",
  distance: "",
  targettype: "",
  scanmodel: "",
  frequency: "",
});
const formupdate = reactive({
  id: "",
  name: "",
  type: "",
  location: "",
  beamwidth: "",
  distance: "",
  targettype: "",
  scanmodel: "",
  frequency: "",
});
const tableData = ref([
  {
    id: "r001",
    name: "合肥站",
    type: "脉冲",
    location: "(107.201,45.21)",
    beamwidth: "10°",
    distance: "100km",
    targettype: "飞机",
    scanmodel: "连续扫描",
    frequency: "X波段",
  },
  {
    id: "r002",
    name: "乌鲁木齐站",
    type: "连续波",
    location: "(107.201,45.21)",
    beamwidth: "10°",
    distance: "100km",
    targettype: "卫星",
    scanmodel: "单点扫描",
    frequency: "S波段",
  },
  {
    id: "r003",
    name: "北京站",
    type: "多普勒",
    location: "(107.201,45.21)",
    beamwidth: "10°",
    distance: "100km",
    targettype: "坦克",
    scanmodel: "跟踪扫描",
    frequency: "X波段",
  },
  {
    id: "r004",
    name: "拉萨站",
    type: "距离测速",
    location: "(107.201,45.21)",
    beamwidth: "10°",
    distance: "100km",
    targettype: "飞机",
    scanmodel: "连续扫描",
    frequency: "L波段",
  },
  {
    id: "r005",
    name: "青岛站",
    type: "合成孔径",
    location: "(107.201,45.21)",
    beamwidth: "10°",
    distance: "100km",
    targettype: "轮船",
    scanmodel: "连续扫描",
    frequency: "C波段",
  },
  {
    id: "r001",
    name: "合肥站",
    type: "相控阵",
    location: "(107.201,45.21)",
    beamwidth: "10°",
    distance: "100km",
    targettype: "飞机",
    scanmodel: "连续扫描",
    frequency: "X波段",
  },
  {
    id: "r006",
    name: "合肥站",
    type: "相控阵",
    location: "(107.201,45.21)",
    beamwidth: "10°",
    distance: "100km",
    targettype: "飞机",
    scanmodel: "连续扫描",
    frequency: "W波段",
  },
  {
    id: "r007",
    name: "合肥站",
    type: "相控阵",
    location: "(107.201,45.21)",
    beamwidth: "10°",
    distance: "100km",
    targettype: "飞机",
    scanmodel: "连续扫描",
    frequency: "Ku波段",
  },
  {
    id: "r008",
    name: "合肥站",
    type: "相控阵",
    location: "(107.201,45.21)",
    beamwidth: "10°",
    distance: "100km",
    targettype: "飞机",
    scanmodel: "连续扫描",
    frequency: "ka波段",
  },
  {
    id: "r009",
    name: "合肥站",
    type: "相控阵",
    location: "(107.201,45.21)",
    beamwidth: "10°",
    distance: "100km",
    targettype: "飞机",
    scanmodel: "连续扫描",
    frequency: "X波段",
  },
  {
    id: "r020",
    name: "合肥站",
    type: "相控阵",
    location: "(107.201,45.21)",
    beamwidth: "10°",
    distance: "100km",
    targettype: "飞机",
    scanmodel: "连续扫描",
    frequency: "X波段",
  },
  {
    id: "r001",
    name: "合肥站",
    type: "相控阵",
    location: "(107.201,45.21)",
    beamwidth: "10°",
    distance: "100km",
    targettype: "飞机",
    scanmodel: "连续扫描",
    frequency: "X波段",
  },
  {
    id: "r021",
    name: "合肥站",
    type: "相控阵",
    location: "(107.201,45.21)",
    beamwidth: "10°",
    distance: "100km",
    targettype: "飞机",
    scanmodel: "连续扫描",
    frequency: "X波段",
  },
  {
    id: "r069",
    name: "合肥站",
    type: "相控阵",
    location: "(107.201,45.21)",
    beamwidth: "10°",
    distance: "100km",
    targettype: "飞机",
    scanmodel: "连续扫描",
    frequency: "X波段",
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
    location,
    beamwidth,
    distance,
    targettype,
    scanmodel,
    frequency,
  } = selectedRow.value;
  formupdate.id = id;
  formupdate.name = name;
  formupdate.type = type;
  formupdate.location = location;
  formupdate.beamwidth = beamwidth;
  formupdate.distance = distance;
  formupdate.targettype = targettype;
  formupdate.scanmodel = scanmodel;
  formupdate.frequency = frequency;
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
const toggleSelection = () => {
  //删除所有勾选的行
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
    location: form.location,
    beamwidth: form.beamwidth,
    distance: form.distance,
    targettype: form.targettype,
    scanmodel: form.scanmodel,
    frequency: form.frequency,
  });
};
const confirmupdate = () => {
  selectedRow.value.id = formupdate.id;
  selectedRow.value.name = formupdate.name;
  selectedRow.value.type = formupdate.type;
  selectedRow.value.location = formupdate.location;
  selectedRow.value.beamwidth = formupdate.beamwidth;
  selectedRow.value.distance = formupdate.distance;
  selectedRow.value.targettype = formupdate.targettype;
  selectedRow.value.scanmodel = formupdate.scanmodel;
  selectedRow.value.frequency = formupdate.frequency;
};
</script>
