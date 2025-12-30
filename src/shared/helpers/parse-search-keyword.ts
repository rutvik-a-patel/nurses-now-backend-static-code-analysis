const parseSearchKeyword = (searchString: string) => {
  // * searchString contains the pattern you want to search for, which includes a single quote (O'Connell).
  // * .replace(/'/g, "''") is used to escape the single quote in the searchString by replacing each single quote with two single quotes.
  const sqlKeywordsRegex =
    /\b(UPDATE|DELETE|INSERT|DROP|ALTER|TRUNCATE|EXEC|DECLARE|XP_CMDSHELL|RESTORE|BACKUP)\b/gi;
  return searchString.replace(/'/g, "''").replace(sqlKeywordsRegex, '');
};
export default parseSearchKeyword;
