import { Navigate, Route, Routes } from 'react-router-dom';
import { Protected } from './auth/Protected';
import { Shell } from './components/layout/Shell';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Courses } from './pages/Courses';
import { Rooms } from './pages/Rooms';
import { Groups } from './pages/Groups';
import { GroupDetail } from './pages/GroupDetail';
import { LessonDetail } from './pages/LessonDetail';
import { HomeworkDetail } from './pages/HomeworkDetail';
import { ExamDetail } from './pages/ExamDetail';
import { Payments } from './pages/Payments';
import { Salaries } from './pages/Salaries';
import { Expenses } from './pages/Expenses';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';
import { MyAttendance } from './pages/student/MyAttendance';
import { MyResults } from './pages/student/MyResults';
import { MyHomework } from './pages/student/MyHomework';
import { MyPayments } from './pages/student/MyPayments';
import { MySalary } from './pages/student/MySalary';
import { useAuth } from './auth/useAuth';

export function App() {
  const { me, loading } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={!loading && me ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        element={
          <Protected>
            <Shell />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="courses" element={<Courses />} />
        <Route path="groups" element={<Groups />} />
        <Route path="groups/:id" element={<GroupDetail />} />
        <Route path="lessons/:id" element={<LessonDetail />} />
        <Route path="profile" element={<Profile />} />

        <Route
          path="rooms"
          element={
            <Protected roles={['SUPERADMIN', 'TEACHER']}>
              <Rooms />
            </Protected>
          }
        />
        <Route
          path="homework/:id"
          element={
            <Protected roles={['SUPERADMIN', 'TEACHER']}>
              <HomeworkDetail />
            </Protected>
          }
        />
        <Route
          path="exams/:id"
          element={
            <Protected roles={['SUPERADMIN', 'TEACHER']}>
              <ExamDetail />
            </Protected>
          }
        />

        <Route
          path="users"
          element={
            <Protected roles={['SUPERADMIN']}>
              <Users />
            </Protected>
          }
        />
        <Route
          path="payments"
          element={
            <Protected roles={['SUPERADMIN']}>
              <Payments />
            </Protected>
          }
        />
        <Route
          path="salaries"
          element={
            <Protected roles={['SUPERADMIN']}>
              <Salaries />
            </Protected>
          }
        />
        <Route
          path="expenses"
          element={
            <Protected roles={['SUPERADMIN']}>
              <Expenses />
            </Protected>
          }
        />

        <Route
          path="me/salary"
          element={
            <Protected roles={['TEACHER']}>
              <MySalary />
            </Protected>
          }
        />
        <Route
          path="me/attendance"
          element={
            <Protected roles={['STUDENT']}>
              <MyAttendance />
            </Protected>
          }
        />
        <Route
          path="me/results"
          element={
            <Protected roles={['STUDENT']}>
              <MyResults />
            </Protected>
          }
        />
        <Route
          path="me/homework"
          element={
            <Protected roles={['STUDENT']}>
              <MyHomework />
            </Protected>
          }
        />
        <Route
          path="me/payments"
          element={
            <Protected roles={['STUDENT']}>
              <MyPayments />
            </Protected>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
