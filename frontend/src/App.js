import { Route } from "react-router-dom";
import "./App.css";
import { BrowserRouter as Router, Routes, useLocation } from "react-router-dom";

//Admin
import Admindashbord from "./Admin/AdminDashbord";
import AllStudents from "./Admin/AllStudents";
import StudentProgress from "./Admin/StudentProgress";
import AdminEnrollmentRequests from "./Admin/Enrollmentrequests";   //course enrollmnt req
import ACourses from "./Admin/Acourses";
import CourseContent from "./Admin/Coursecontent";
import AddCourse from "./Admin/AddCourse";
import AQuiz from "./Admin/Quiz";
import AddQuiz from "./Admin/AddQuiz";
import AUpdateQuiz from "./Admin/UpdateQuiz";
import ViewQuiz from "./Admin/ViewQuiz";
import AllPayments from "./Admin/AllPayments";

//Student
import StudentRegister from "./student/StudentRegister";
import ResetPassword from "./student/ResetPassword";
import ForgotPassword from "./student/ForgotPassword";
import VerifyOTP from "./student/VerifyOTP";             //reset pw
import FPWVerifyOtp from "./student/fpVerifyOTP";        //fogot pw     
import Home from "./Home";
import SciencePage from "./Courses/SciencePage";
import MathsPage from "./Courses/MathsPage";
import TechPage from "./Courses/TechnologyPage";

import StudentProfile from "./student/Studentprofile";
import AllQuiz from "./student/Quiz/AllQuizez";
import SViewQuiz from "./student/Quiz/SViewQuiz";
import Questions from "./student/Quiz/Questions";
import Payment from "./Payments/Paymnt";
import QuizPayment from "./student/Quiz/Quizpaymnt";

import PaymentFailed from "./Payments/PaymentFailed";
import Success from "./Payments/Success";

//courses
import Coursepage from "./Courses/CoursePage";
import StudentCourseContent from "./Courses/StudentCoursecontent";

import HomePage from "./HomePage";
import StudentLogin from "./Login";
import Navbar from "./Navbar";
import About from "./About";
import Contact from "./Contact";
import AdminNavbar from "./AdminNavbar";
import Footer from "./footer";

function AppContent() {
  const location = useLocation();
  const isAdminRoute =
    location.pathname.startsWith("/a-dashbord") ||
    location.pathname.startsWith("/all-students") ||
    location.pathname.startsWith("/a-courses") ||
    location.pathname.startsWith("/a-course-content/") ||
    location.pathname.startsWith("/enrollment-req") ||
    location.pathname.startsWith("/a-quiz") ||
    location.pathname.startsWith("/a-updatequiz") ||
    location.pathname.startsWith("/a-viewquiz") ||
    location.pathname.startsWith("/add-course") ||
    location.pathname.startsWith("/sprogress") ||
    location.pathname.startsWith("/all-payments") ||
    location.pathname.startsWith("/add-quiz");

  const isStudentRoute =
    location.pathname.startsWith("/s-profile") ||
    location.pathname.startsWith("/all-courses") ||
    location.pathname.startsWith("/s-course-content/") ||
    location.pathname.startsWith("/about") ||
    location.pathname.startsWith("/contact") ||
    location.pathname.startsWith("/home") ||
    location.pathname.startsWith("/s-allquiz") ||
    location.pathname.startsWith("/s-viewquizz") ||
    location.pathname.startsWith("/questions") ||
    location.pathname.startsWith("/payment") ||
    location.pathname.startsWith("/qpayment") ||
    location.pathname.startsWith("/science-page") ||
    location.pathname.startsWith("/math-page") ||
    location.pathname.startsWith("/tech-page") ||
    location.pathname.startsWith("/payment-fail") ||
    location.pathname.startsWith("/success");

  return (
    <div
      className={`App min-h-screen flex ${isAdminRoute ? "flex-row" : "flex-col"}`}
    >
      {isStudentRoute && <Navbar />}
      {isAdminRoute && <AdminNavbar />}

      <main className="flex-grow">
        <Routes>
          {/* Admin */}
          <Route path="/a-dashbord" element={<Admindashbord />} />
          <Route path="/a-courses" element={<ACourses />} />
          <Route path="/enrollment-req" element={<AdminEnrollmentRequests />} />
          <Route path="/a-quiz" element={<AQuiz />} />
          <Route path="/a-updatequiz/:id" element={<AUpdateQuiz />} />
          <Route path="/a-viewquiz/:id" element={<ViewQuiz />} />
          <Route path="/add-course" element={<AddCourse />} />
          <Route path="/all-payments" element={<AllPayments />} />
          <Route path="/sprogress/:id" element={<StudentProgress />} />
          <Route path="/add-quiz" element={<AddQuiz />} />
          <Route
            path="/a-course-content/:course_code"
            element={<CourseContent />}
          />

          {/* Students */}
          <Route path="/all-students" element={<AllStudents />} />
          <Route path="/fogot-pw" element={<ForgotPassword />} />
          <Route path="/reset-pw" element={<ResetPassword />} />
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/student-reg" element={<StudentRegister />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/fpw-verify-otp" element={<FPWVerifyOtp />} />
          <Route path="/s-profile/:name" element={<StudentProfile />} />
          <Route path="/s-allquiz" element={<AllQuiz />} />
          <Route path="/s-viewquizz/:id" element={<SViewQuiz />} />
          <Route path="/questions/:id" element={<Questions />} />
          <Route path="/qpayment" element={<QuizPayment />} />
          <Route path="/science-page" element={<SciencePage />} />
          <Route path="/math-page" element={<MathsPage />} />
          <Route path="/tech-page" element={<TechPage />} />
          <Route path="/payment-fail" element={<PaymentFailed />} />
          <Route path="/success" element={<Success />} />
          <Route
            path="/s-course-content/:course_code"
            element={<StudentCourseContent />}
          />

          {/* Courses */}
          <Route path="/all-courses" element={<Coursepage />} />

          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      {isStudentRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
