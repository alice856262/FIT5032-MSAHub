<template>
  <div>
    <!-- Search all columns input -->
    <label for="globalSearch" class="sr-only">Global Search</label>
    <input
      id="globalSearch"
      type="text"
      v-model="globalSearch"
      placeholder="Search all columns..."
      class="search-input mb-3"
      aria-label="Global search across all columns"
    />

    <table class="table" aria-label="Data Table">
      <thead>
        <!-- loop through columns, enabling sorting by clicking on headers, with ascending/descending indicators -->
        <tr>
          <th v-for="(column, index) in columns" 
            :key="index" 
            @click="sortByColumn(column)"
            scope="col"
            :aria-sort="currentSort.column === column.key ? (currentSort.asc ? 'ascending' : 'descending') : 'none'">
            {{ column.label }}
            <span v-if="currentSort.column === column.key">
              {{ currentSort.asc ? '▲' : '▼' }}
            </span>
          </th>
        </tr>
        <!-- add individual search boxes for each searchable column -->
        <tr>
          <th v-for="(column, index) in columns" :key="'search-' + index" scope="col">
            <label v-if="column.searchable" :for="'search-' + column.key" class="sr-only">
              Search {{ column.label }}
            </label>
            <input
              v-if="column.searchable"
              :id="'search-' + column.key"
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
        <tr
          v-for="(row, index) in paginatedRows"
          :key="index"
          @mouseover="hoveredRow = index"
          @mouseleave="hoveredRow = null"
          :class="{ 'row-hover': hoveredRow === index }">
          <!-- loop through paginatedRows and displays each row, with conditional links for titles -->
          <td v-for="(column, colIndex) in columns" :key="colIndex">
            <router-link
              v-if="column.key === 'title'"
              :to="`/article/${row.id}`"
              class="article-link"
              aria-label="Go to article {{ row[column.key] }}">
              {{ row[column.key] }}
            </router-link>
            <span v-else>{{ row[column.key] }}</span>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1" aria-label="Go to previous page">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" aria-label="Go to next page">Next</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  props: {  // receive rows, columns, and rowsPerPage from the parent component
    rows: {
      type: Array,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
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
    const hoveredRow = ref(null);

    // Set up empty search fields for each column
    const initializeColumnSearch = () => {
      props.columns.forEach((col) => {
        columnSearch.value[col.key] = '';
      });
    };
    initializeColumnSearch();

    // Filter rows based on global search and column-specific search inputs
    const filteredRows = computed(() => {
      let filtered = props.rows;
      // Global Search
      if (globalSearch.value) {
        filtered = filtered.filter((row) =>
          props.columns.some((col) =>  // use ".some" to check all columns
            String(row[col.key]).toLowerCase().includes(globalSearch.value.toLowerCase())
          )
        );
      }
      // Column Search
      filtered = filtered.filter((row) =>
        props.columns.every(  // compare each column's search value (columnSearch[col.key]) to the corresponding cell value in lowercase
          (col) =>
            !columnSearch.value[col.key] ||
            String(row[col.key])
              .toLowerCase()
              .includes(columnSearch.value[col.key].toLowerCase())
        )
      );
      return filtered;
    });

    // Sort rows based on the selected column and order
    const sortedRows = computed(() => {
      if (!currentSort.value.column) return filteredRows.value;

      return filteredRows.value.slice().sort((a, b) => {
        // If a column is set, it sorts filteredRows by that column using asc or desc based on modifier (1 for ascending, -1 for descending)
        const modifier = currentSort.value.asc ? 1 : -1;
        if (a[currentSort.value.column] < b[currentSort.value.column]) return -1 * modifier;
        if (a[currentSort.value.column] > b[currentSort.value.column]) return 1 * modifier;
        return 0;
      });
    });

    // Compute total pages and paginates rows based on the current page
    const totalPages = computed(() => Math.ceil(sortedRows.value.length / props.rowsPerPage));
    const paginatedRows = computed(() => {
      const start = (currentPage.value - 1) * props.rowsPerPage;
      return sortedRows.value.slice(start, start + props.rowsPerPage);  // return only the rows for the current page by slicing sortedRows
    });

    // Toggle sorting for the selected column
    const sortByColumn = (column) => {
      if (currentSort.value.column === column.key) {
        currentSort.value.asc = !currentSort.value.asc;
      } else {
        currentSort.value.column = column.key;
        currentSort.value.asc = true;  // default to ascending order
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

    watch([globalSearch, columnSearch], () => {
      currentPage.value = 1;
    });

    // Expose the reactive properties and methods for use in the template
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
      hoveredRow,
    };
  },
};
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

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

.table td {
  cursor: default;
}

.row-hover {
  background-color: #f5f5f5;
}

.article-link {
  color: #333;
  text-decoration: none;
}

.article-link:hover {
  color: #e5533d;
  font-weight: bold;
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
