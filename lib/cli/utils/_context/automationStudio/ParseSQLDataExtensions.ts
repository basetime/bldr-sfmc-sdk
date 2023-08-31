export default (sqlQuery: string) => {
    // Remove comments from the query
    sqlQuery = sqlQuery.replace(/--.*|\/\*[^]*?\*\//g, '');

    // Find all table names using a regex pattern
    const tableNames = sqlQuery.match(/(?:FROM|JOIN)\s+(\S+)(?:\s+|\b|$)/gi);

    // Extract the table names without the keywords FROM and JOIN
    const cleanedTableNames = tableNames&& tableNames.map(tableName => tableName.replace(/(?:FROM|JOIN)\s+/i, '').trim());

    // Remove brackets from the table names
    const cleanedTableNamesWithoutBrackets = cleanedTableNames && cleanedTableNames.map(tableName => tableName.replace(/(?:\[|\])/g, ''));

    // Exclude table names that begin with an underscore
    const filteredTableNames = cleanedTableNamesWithoutBrackets && cleanedTableNamesWithoutBrackets.filter(tableName => !tableName.startsWith('_'));

    return filteredTableNames || [];
  }
