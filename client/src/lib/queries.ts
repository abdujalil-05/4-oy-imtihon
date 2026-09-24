import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, HttpError } from './api';

export function useList<T>(key: QueryKey, path: string, enabled = true) {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => api.get<T>(path),
    enabled,
  });
}

interface MutationConfig<TVars, TData> {
  run: (vars: TVars) => Promise<TData>;
  invalidate?: QueryKey[];
  success?: string;
  onDone?: (data: TData) => void;
}

export function useApiMutation<TVars, TData>({
  run,
  invalidate = [],
  success,
  onDone,
}: MutationConfig<TVars, TData>) {
  const client = useQueryClient();

  return useMutation<TData, Error, TVars>({
    mutationFn: run,
    onSuccess: (data) => {
      invalidate.forEach((key) => {
        void client.invalidateQueries({ queryKey: key });
      });
      if (success) toast.success(success);
      onDone?.(data);
    },
    onError: (error) => {
      toast.error(error instanceof HttpError ? error.message : 'Amalni bajarib bo‘lmadi');
    },
  });
}

export const keys = {
  users: ['users'] as QueryKey,
  courses: ['courses'] as QueryKey,
  rooms: ['rooms'] as QueryKey,
  groups: ['groups'] as QueryKey,
  group: (id: number) => ['group', id] as QueryKey,
  groupStudents: (id: number) => ['group-students', id] as QueryKey,
  lessons: (groupId: number) => ['lessons', groupId] as QueryKey,
  lesson: (id: number) => ['lesson', id] as QueryKey,
  attendance: (lessonId: number) => ['attendance', lessonId] as QueryKey,
  homeworks: (lessonId: number) => ['homeworks', lessonId] as QueryKey,
  homework: (id: number) => ['homework', id] as QueryKey,
  submissions: (homeworkId: number) => ['submissions', homeworkId] as QueryKey,
  exams: (groupId: number) => ['exams', groupId] as QueryKey,
  exam: (id: number) => ['exam', id] as QueryKey,
  examResults: (examId: number) => ['exam-results', examId] as QueryKey,
  payments: ['payments'] as QueryKey,
  salaries: ['salaries'] as QueryKey,
  expenses: ['expenses'] as QueryKey,
  devices: ['devices'] as QueryKey,
  myAttendance: ['my-attendance'] as QueryKey,
  myResults: ['my-results'] as QueryKey,
  mySubmissions: ['my-submissions'] as QueryKey,
  myPayments: ['my-payments'] as QueryKey,
  mySalary: ['my-salary'] as QueryKey,
};

export { api };
