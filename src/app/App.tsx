import CreditCardApplication from "./components/CreditCardApplication";
import ReviewerApprovalPage from "./components/ReviewerApprovalPage";

export default function App() {
  const isReviewerMode = window.location.pathname.toLowerCase().includes('/reviewer');

  return (
    isReviewerMode ? <ReviewerApprovalPage /> : <CreditCardApplication />
  );
}