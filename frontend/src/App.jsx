
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FeedbackPage from "./pages/FeedbackPage";
import AdminFeedbackPage from "./pages/AdminFeedbackPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<FeedbackPage />} />
                <Route path="/admin" element={<AdminFeedbackPage />} />
            </Routes>
        </Router>
    );
}

export default App;

