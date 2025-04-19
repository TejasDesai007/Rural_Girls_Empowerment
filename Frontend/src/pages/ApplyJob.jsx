import { useParams } from "react-router-dom";
import JobApplicationForm from "@/components/JobApplicationForm";

const ApplyJob = () => {
  const { jobId } = useParams();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Apply for Job</h2>
      <JobApplicationForm jobId={jobId} />
    </div>
  );
};

export default ApplyJob;
