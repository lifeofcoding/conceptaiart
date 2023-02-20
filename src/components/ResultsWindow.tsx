import Spinner from "@components/Spinner";

const ResultsWindow = ({
  isLoading,
  image,
}: {
  isLoading: boolean;
  image?: string;
}) => {
  if (isLoading) {
    return <Spinner />;
  }

  if (image) {
    return <img src={image} alt="Generated Image" />;
  }

  return <p>Your concept will appear here</p>;
};

export default ResultsWindow;
