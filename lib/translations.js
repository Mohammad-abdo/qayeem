/**
 * Helper functions for getting translated content based on current language
 */

/**
 * Get book title based on language preference
 * @param {Object} book - Book object with title and titleAr
 * @param {string} language - Current language ('ar' or 'en')
 * @returns {string} - Translated title
 */
export function getBookTitle(book, language = 'ar') {
  if (!book) return '';
  return language === 'ar' 
    ? (book.titleAr || book.title || '')
    : (book.title || book.titleAr || '');
}

/**
 * Get book description based on language preference
 * @param {Object} book - Book object with description and descriptionAr
 * @param {string} language - Current language ('ar' or 'en')
 * @returns {string} - Translated description
 */
export function getBookDescription(book, language = 'ar') {
  if (!book) return '';
  return language === 'ar'
    ? (book.descriptionAr || book.description || '')
    : (book.description || book.descriptionAr || '');
}

/**
 * Get book author based on language preference
 * @param {Object} book - Book object with author and authorAr
 * @param {string} language - Current language ('ar' or 'en')
 * @returns {string} - Translated author name
 */
export function getBookAuthor(book, language = 'ar') {
  if (!book) return '';
  return language === 'ar'
    ? (book.authorAr || book.author || '')
    : (book.author || book.authorAr || '');
}

/**
 * Get book category based on language preference
 * @param {Object} book - Book object with category and categoryAr
 * @param {string} language - Current language ('ar' or 'en')
 * @returns {string} - Translated category
 */
export function getBookCategory(book, language = 'ar') {
  if (!book) return '';
  return language === 'ar'
    ? (book.categoryAr || book.category || '')
    : (book.category || book.categoryAr || '');
}

/**
 * Get user name based on language preference
 * @param {Object} user - User object with name and nameAr
 * @param {string} language - Current language ('ar' or 'en')
 * @returns {string} - Translated name
 */
export function getUserName(user, language = 'ar') {
  if (!user) return '';
  return language === 'ar'
    ? (user.nameAr || user.name || '')
    : (user.name || user.nameAr || '');
}











