// courseId is the persistent identity. Renaming a title must not lose progress.
export function courseIdentity(catalog) {
  const courseId = catalog?.courseId, title = catalog?.title;
  if (typeof courseId !== 'string' || courseId.length < 2 || courseId.length > 64 || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(courseId)) {
    throw new Error('课程 courseId 必须是稳定的小写英文、数字与短横线编号（2–64 字符）');
  }
  if (typeof title !== 'string' || !title.trim() || title.length > 160) throw new Error('缺少有效课程标题');
  return { courseId, title: title.trim() };
}

export function databaseName(catalog, prefix = 'textbook-learning') {
  if (typeof prefix !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(prefix)) throw new Error('学习记录命名空间无效');
  return `${prefix}:${courseIdentity(catalog).courseId}:v1`;
}

export function backupFilename(catalog, nowISO = new Date().toISOString()) {
  const { courseId } = courseIdentity(catalog);
  return `${courseId}-学习备份-${nowISO.slice(0, 10)}.json`;
}

// A catalogue, reference page, or lesson opened for browsing never synchronizes
// state. In particular, a new release cannot migrate old state during browsing.
export function isReadOnlyRoute(route) {
  return ['exercises', 'exercise', 'progress'].includes(route.view)
    || route.view === 'lesson' && route.mode !== 'new';
}

export async function stateForInitialRoute(store, route) {
  return isReadOnlyRoute(route) ? store.read() : store.dispatch({ type: 'syncContent' });
}
