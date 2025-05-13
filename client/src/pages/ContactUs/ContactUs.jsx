
import ContactForm from "../../components/ContactUsDisplay/ContactForm";
import ContactInfo from "../../components/ContactUsDisplay/ContactInfo";

const ContactUs = () => {
  return (
    <main className="py-5">
      <div className="container">
        <div className="row g-5">
          <section className="col-lg-8">
            <ContactForm />
          </section>

          <section className="col-lg-4">
            <ContactInfo />
          </section>
        </div>
      </div>
    </main>
  );
};

export default ContactUs;
