import React from "react";

const ContentSection = ({
  isDark,
  title,
  description,
  imageSrc,
  imageFirst = false,
  showSquare = false,
}) => {
  const textColor = isDark ? "text-white" : "text-dark";
  const bgColor = isDark ? "bg-dark" : "bg-white";

  const TextContent = () => (
    <article className={`${textColor}`}>
      <div className="d-flex align-items-start gap-3">
        {showSquare && (
          <div
            className="bg-primary"
            style={{ width: "50px", height: "50px" }}
          ></div>
        )}
        <h2 className="display-5 fw-medium">{title}</h2>
      </div>
      <p className="mt-4 fw-light fs-5 lh-lg">{description}</p>
    </article>
  );

  const ImageContent = () => (
    <img src={imageSrc} alt={title} className="img-fluid" />
  );

  return (
    <section className={`${bgColor} py-5`}>
      <div className="container">
        <div className="row align-items-center">
          {imageFirst ? (
            <>
              <div className="col-12 col-md-7">
                <ImageContent />
              </div>
              <div className="col-12 col-md-5">
                <TextContent />
              </div>
            </>
          ) : (
            <>
              <div className="col-12 col-md-6">
                <TextContent />
              </div>
              <div className="col-12 col-md-6">
                <ImageContent />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContentSection;
