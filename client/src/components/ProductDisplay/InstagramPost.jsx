import PropTypes from "prop-types";

const InstagramPost = ({ image, content, date }) => {
  return (
    <div className="card h-100">
      <img src={image} className="card-img-top" alt="Instagram post" />
      <div className="card-body">
        <p className="card-text">{content}</p>
        <p className="card-text text-muted">{date}</p>
      </div>
    </div>
  );
};

InstagramPost.propTypes = {
  image: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
};

export default InstagramPost;
