<template>
  <DataTable
    :columns="columns"
    :data="Tables"
    :loading="loading"
    :searchable="searchable"
  >
    <template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>
  </DataTable>
</template>

<script>
import DataTable from "./DataTable.vue";

export default {
  name: "TableComponents",
  components: { DataTable },
  props: {
    labels: {
      type: Array,
      default: () => [
        { field: "id", text: "ID" },
        { field: "name", text: "Name" },
        { field: "date_created", text: "Created At" },
      ],
    },
    Tables: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    searchable: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    columns() {
      return this.labels.map((l) => ({
        key: l.field || l.key,
        label: l.text || l.label,
        sortable: l.sortable !== undefined ? l.sortable : true,
      }));
    },
  },
};
</script>
