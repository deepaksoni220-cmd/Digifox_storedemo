import "./ContactForm.css";

import { MdOutlineArrowOutward } from "react-icons/md";

const ContactForm = () => {
  return (
    <section className="contact-form">
      <div className="contact-parallax-image-wrapper">
        <h1>Digifox</h1>
        <img src="/contact-form/contact-parallax.png" alt="" />
      </div>
      <div className="contact-form-container">
        <div className="cf-header">
          <h4>Transmit updates, not noise.</h4>
        </div>
        <div className="cf-copy">
          <p className="bodyCopy sm">
            You’ll only hear from us when something built is worth showing.
          </p>
        </div>
        <div className="cf-input">
          <input type="text" placeholder="Enter Signal Address" />
        </div>
        <div className="cf-submit">
          <MdOutlineArrowOutward />
        </div>
        <div className="cf-footer">
          <div className="cf-divider"></div>
          <div className="cf-footer-copy">
            <p className="bodyCopy sm">
              No marketing cycles. Just rare, coded dispatches.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
