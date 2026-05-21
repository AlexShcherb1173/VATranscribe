# VATranscribe: active job context-menu fix

Изменены файлы:

- apps/web/src/pages/jobs/JobsPage.tsx
- apps/web/src/widgets/job-table/JobTable.tsx

Что исправлено:

- ПКМ по активной задаче (pending/queued/running/processing/started/in_progress) теперь показывает действие "Отменить", а не "Удалить".
- Для активной задачи frontend вызывает POST /api/v1/jobs/{id}/stop, а не DELETE /api/v1/jobs/{id}.
- DELETE больше не отправляется на running-задачу, поэтому не должен появляться 409 Conflict.
- Для завершённых/ошибочных/отменённых задач пункт остаётся "Удалить".
- Если backend всё-таки вернул ошибку, frontend показывает detail из API, а не общий текст "За