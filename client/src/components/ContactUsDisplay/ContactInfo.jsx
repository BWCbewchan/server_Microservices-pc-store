const ContactInfo = () => {
    return (
      <div className="card bg-light border-0 p-4">
        <div className="card-body">
          <div className="d-flex gap-3 mb-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/434eb62f74d238728655cbbbec36696366586164d324395631a3ccf0cfa01b27?placeholderIfAbsent=true&apiKey=52b7549cc4dc41b1b490a6ca3e3b5e4d"
              alt="Address icon"
              className="object-fit-contain"
              width="35"
              height="35"
            />
            <div>
              <h2 className="h5 fw-semibold mb-1">Address:</h2>
              <p className="small mb-0">1234 Street Adress City Address, 1234</p>
            </div>
          </div>
  
          <div className="d-flex gap-3 mb-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/caa3f5005fc66002c635bda6661a6567323bdb165c8aab51bbcaa111a765b0be?placeholderIfAbsent=true&apiKey=52b7549cc4dc41b1b490a6ca3e3b5e4d"
              alt="Phone icon"
              className="object-fit-contain"
              width="35"
              height="35"
            />
            <div>
              <h2 className="h5 fw-semibold mb-1">Phone:</h2>
              <p className="small mb-0">(00)1234 5678</p>
            </div>
          </div>
  
          <div className="d-flex gap-3 mb-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/e09ba2a40031e7975c31f90ae842daa6a45cf41786e5227cc9e99bf9a53d99a3?placeholderIfAbsent=true&apiKey=52b7549cc4dc41b1b490a6ca3e3b5e4d"
              alt="Clock icon"
              className="object-fit-contain"
              width="35"
              height="35"
            />
            <div>
              <h2 className="h5 fw-semibold mb-1">We are open:</h2>
              <p className="small mb-0">
                Monday - Thursday: 9:00 AM - 5:30 PM
                <br />
                Friday 9:00 AM - 6:00 PM
                <br />
                Saturday: 11:00 AM - 5:00 PM
              </p>
            </div>
          </div>
  
          <div className="d-flex gap-3">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/655b0a2b514427c125b22a8e37da0fcc965d9569ded22ec567382bdce8895876?placeholderIfAbsent=true&apiKey=52b7549cc4dc41b1b490a6ca3e3b5e4d"
              alt="Email icon"
              className="object-fit-contain"
              width="35"
              height="35"
            />
            <div>
              <h2 className="h5 fw-semibold mb-1">E-mail:</h2>
              <a
                href="mailto:shop@email.com"
                className="small text-primary text-decoration-none"
              >
                shop@email.com
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default ContactInfo;
  