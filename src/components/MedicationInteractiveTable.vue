<template>
  <div>
    <!-- Search all columns input -->
    <input
      type="text"
      v-model="globalSearch"
      placeholder="Search all columns..."
      class="search-input mb-3"
      aria-label="Search all columns"
    />

    <!-- Medication table -->
    <table class="table" role="table">
      <thead>
        <!-- loop through columns, enabling sorting by clicking on headers, with ascending/descending indicators -->
        <tr>
          <th v-for="(column, index) in columns" 
            :key="index" 
            @click="sortByColumn(column)"
            :aria-sort="currentSort.column === column.key ? (currentSort.asc ? 'ascending' : 'descending') : 'none'"
            role="columnheader"
            scope="col"
            :aria-label="'Sort by ' + column.label">
            {{ column.label }}
            <span v-if="currentSort.column === column.key">{{ currentSort.asc ? '▲' : '▼' }}</span>
          </th>
        </tr>
        <!-- add individual search boxes for each searchable column -->
        <tr>
          <th v-for="(column, index) in columns" :key="'search-' + index">
            <input
              v-if="column.searchable"
              type="text"
              v-model="columnSearch[column.key]"
              placeholder="Search..."
              class="column-search-input"
              :aria-label="'Search ' + column.label"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in paginatedRows" :key="index" role="row">
          <td v-for="(column, colIndex) in columns" :key="colIndex" role="cell">
            <span>{{ row[column.key] }}</span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="pagination" role="navigation" aria-label="Pagination Navigation">
      <button @click="prevPage" :disabled="currentPage === 1" aria-label="Previous Page">Previous</button>
      <span aria-live="polite">Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" aria-label="Next Page">Next</button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  props: {
    columns: {
      type: Array,
      required: true,
    },
    rows: {
      type: Array,
      required: true, // Ensure rows are passed properly from parent component
    },
    rowsPerPage: {
      type: Number,
      default: 10,
    },
  },
  setup(props) {
    const currentPage = ref(1);
    const globalSearch = ref('');
    const columnSearch = ref({});
    const currentSort = ref({ column: null, asc: true });

    const initializeColumnSearch = () => {
      props.columns.forEach((col) => {
        columnSearch.value[col.key] = '';
      });
    };
    initializeColumnSearch();

    // Filter rows based on global and column-specific searches
    const filteredRows = computed(() => {
      let filtered = props.rows; // Use the rows passed from parent component

      if (globalSearch.value) {
        filtered = filtered.filter((row) =>
          props.columns.some((col) =>
            String(row[col.key]).toLowerCase().includes(globalSearch.value.toLowerCase())
          )
        );
      }

      filtered = filtered.filter((row) =>
        props.columns.every(
          (col) =>
            !columnSearch.value[col.key] ||
            String(row[col.key])
              .toLowerCase()
              .includes(columnSearch.value[col.key].toLowerCase())
        )
      );

      return filtered;
    });

    // Sorting logic
    const sortedRows = computed(() => {
      if (!currentSort.value.column) return filteredRows.value;

      return filteredRows.value.slice().sort((a, b) => {
        const modifier = currentSort.value.asc ? 1 : -1;
        if (a[currentSort.value.column] < b[currentSort.value.column]) return -1 * modifier;
        if (a[currentSort.value.column] > b[currentSort.value.column]) return 1 * modifier;
        return 0;
      });
    });

    // Pagination logic
    const totalPages = computed(() => Math.ceil(sortedRows.value.length / props.rowsPerPage));
    const paginatedRows = computed(() => {
      const start = (currentPage.value - 1) * props.rowsPerPage;
      return sortedRows.value.slice(start, start + props.rowsPerPage);
    });

    const sortByColumn = (column) => {
      if (currentSort.value.column === column.key) {
        currentSort.value.asc = !currentSort.value.asc;
      } else {
        currentSort.value.column = column.key;
        currentSort.value.asc = true;
      }
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value += 1;
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value -= 1;
      }
    };

    return {
      globalSearch,
      columnSearch,
      currentPage,
      currentSort,
      paginatedRows,
      totalPages,
      sortByColumn,
      nextPage,
      prevPage,
    };
  },
};
</script>
  
<style scoped>
.search-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.column-search-input {
  width: 100%;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.table th {
  cursor: pointer;
  background-color: #f9f9f9;
}

.table th:hover {
  background-color: #f1f1f1;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.pagination button {
  padding: 10px 20px;
  border: none;
  background-color: #e5533d;
  color: #ffffff;
  cursor: pointer;
  border-radius: 4px;
}

.pagination button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}
</style>
