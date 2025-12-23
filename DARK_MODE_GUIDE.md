# دليل الوضع الداكن (Dark Mode Guide)

تم تفعيل الوضع الداكن في التطبيق. يجب تحديث جميع صفحات لوحة التحكم لاستخدام الألوان المتوافقة مع الوضع الداكن.

## الأنماط الشائعة التي يجب تحديثها:

### 1. الألوان الأساسية:
- `bg-white` → `bg-white dark:bg-gray-800`
- `text-black-500` → `text-gray-900 dark:text-white`
- `text-black-600` → `text-gray-700 dark:text-gray-300`
- `text-black-400` → `text-gray-600 dark:text-gray-400`
- `border-black-100` → `border-gray-200 dark:border-gray-700`
- `bg-black-50` → `bg-gray-100 dark:bg-gray-700`
- `bg-black-100` → `bg-gray-200 dark:bg-gray-600`

### 2. الأزرار:
```jsx
// قبل:
<button className="bg-primary-500 text-white">...</button>

// بعد (لا يحتاج تغيير - يعمل بشكل صحيح):
<button className="bg-primary-500 text-white dark:bg-primary-600">...</button>
```

### 3. البطاقات:
```jsx
// قبل:
<div className="bg-white rounded-lg border border-black-100">...</div>

// بعد:
<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">...</div>
```

### 4. حقول الإدخال:
```jsx
// قبل:
<input className="bg-white border border-black-100 text-black-500" />

// بعد:
<input className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" />
```

### 5. الجداول:
```jsx
// قبل:
<table className="bg-white">
  <tr className="border-b border-black-100">
    <td className="text-black-500">...</td>
  </tr>
</table>

// بعد:
<table className="bg-white dark:bg-gray-800">
  <tr className="border-b border-gray-200 dark:border-gray-700">
    <td className="text-gray-900 dark:text-white">...</td>
  </tr>
</table>
```

## ملاحظات مهمة:

1. **لا تستخدم `text-white` على خلفيات بيضاء** - استخدم دائماً `text-gray-900 dark:text-white`
2. **الأزرار الملونة** (مثل `bg-primary-500`, `bg-green-500`) تعمل بشكل صحيح مع `text-white`
3. **الخلفيات المتدرجة** (`bg-gradient-to-r`) تحتاج إلى ألوان داكنة متوافقة

## مثال كامل:

```jsx
// قبل:
<div className="bg-white rounded-lg shadow-md p-6 border border-black-100">
  <h2 className="text-xl font-bold text-black-500 mb-4">العنوان</h2>
  <p className="text-black-600">النص</p>
  <button className="bg-primary-500 text-white px-4 py-2 rounded">
    زر
  </button>
</div>

// بعد:
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">العنوان</h2>
  <p className="text-gray-700 dark:text-gray-300">النص</p>
  <button className="bg-primary-500 dark:bg-primary-600 text-white px-4 py-2 rounded">
    زر
  </button>
</div>
```








