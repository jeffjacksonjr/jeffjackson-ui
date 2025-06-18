import { useState } from 'react';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    otherEventType: '',
    eventDate: '',
    address: '',
    city: '',
    postalCode: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.eventType) newErrors.eventType = 'Event type is required';
    if (formData.eventType === 'Other' && !formData.otherEventType) {
      newErrors.otherEventType = 'Please specify your event type';
    }
    if (!formData.eventDate) newErrors.eventDate = 'Event date is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.postalCode) newErrors.postalCode = 'Postal code is required';
    if (!formData.message) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      setIsSubmitting(true);
      
      // Simulate form submission
      setTimeout(() => {
        console.log('Form submitted:', formData);
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          eventType: '',
          otherEventType: '',
          eventDate: '',
          address: '',
          city: '',
          postalCode: '',
          message: ''
        });
        
        // Hide success message after 5 seconds
        setTimeout(() => setSubmitSuccess(false), 5000);
      }, 1500);
    }
  };

  return (
    <section id="contact" className="py-20 bg-black text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          Get In <span className="text-purple-400">Touch</span>
        </h2>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/2">
            <h3 className="text-2xl font-semibold mb-6">Enquiry</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full bg-gray-800 border ${
                      errors.name ? "border-red-500" : "border-gray-700"
                    } rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full bg-gray-800 border ${
                      errors.email ? "border-red-500" : "border-gray-700"
                    } rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>
    <label htmlFor="phone" className="block mb-2">
      Phone Number
    </label>
    <input
      type="tel"
      id="phone"
      name="phone"
      value={formData.phone}
      onChange={handleChange}
      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
    />
  </div>

  <div>
    <label htmlFor="eventType" className="block mb-2">
      Event Type *
    </label>
    <select
      id="eventType"
      name="eventType"
      value={formData.eventType}
      onChange={handleChange}
      className={`w-full bg-gray-800 border ${
        errors.eventType ? "border-red-500" : "border-gray-700"
      } rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500`}
    >
      <option value="">Select an option</option>
      <option value="Wedding">Wedding</option>
      <option value="Corporate">Corporate Event</option>
      <option value="Club">Club Night</option>
      <option value="Festival">Festival</option>
      <option value="Private">Private Party</option>
      <option value="Other">Other</option>
    </select>
    {errors.eventType && (
      <p className="text-red-500 text-sm mt-1">
        {errors.eventType}
      </p>
    )}
  </div>

  {/* Move the Other field outside the grid and make it full width */}
  {formData.eventType === 'Other' && (
    <div className="col-span-2"> {/* This spans both columns */}
      <label htmlFor="otherEventType" className="block mb-2">
        Please specify your event type *
      </label>
      <input
        type="text"
        id="otherEventType"
        name="otherEventType"
        value={formData.otherEventType}
        onChange={handleChange}
        className={`w-full bg-gray-800 border ${
          errors.otherEventType ? "border-red-500" : "border-gray-700"
        } rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500`}
      />
      {errors.otherEventType && (
        <p className="text-red-500 text-sm mt-1">
          {errors.otherEventType}
        </p>
      )}
    </div>
  )}
</div>

              <div>
                <label htmlFor="eventDate" className="block mb-2">
                  Event Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full bg-gray-800 border ${
                      errors.eventDate ? "border-red-500" : "border-gray-700"
                    } rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    onClick={(e) => e.target.showPicker()}
                  />
                </div>
                {errors.eventDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.eventDate}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="address" className="block mb-2">
                  Complete Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Complete address with zip code"
                  className={`w-full bg-gray-800 border ${
                    errors.address ? "border-red-500" : "border-gray-700"
                  } rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="city" className="block mb-2">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full bg-gray-800 border ${errors.city ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
                
                <div>
                  <label htmlFor="postalCode" className="block mb-2">Zip/Postal Code *</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className={`w-full bg-gray-800 border ${errors.postalCode ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                  {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Ready to party? Share details about your event, including dates, requests, or any questions here! "
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full bg-gray-800 border ${
                    errors.message ? "border-red-500" : "border-gray-700"
                  } rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                ></textarea>
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                )}
              </div>

              <p className='text-purple-400'>Deposits are non-refundable unless stated in the contract.</p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-medium transition duration-300 w-full md:w-auto"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>

              {submitSuccess && (
                <div className="bg-green-600 text-white p-4 rounded-lg mt-4">
                  Thank you! Your booking request has been sent successfully.
                  We'll get back to you soon.
                </div>
              )}
            </form>
          </div>

          <div className="lg:w-1/2">
            <h3 className="text-2xl font-semibold mb-6">Contact Info</h3>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-600 p-3 rounded-full">
                  <EnvelopeIcon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold">Email</h4>
                  <a
                    href="mailto:jefferyj829@yahoo.com"
                    className="text-purple-400 hover:underline"
                  >
                    jefferyj829@yahoo.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-600 p-3 rounded-full">
                  <PhoneIcon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold">Phone</h4>
                  <a
                    href="tel:+12403887358"
                    className="text-purple-400 hover:underline"
                  >
                    +1 (240) 388-7358
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-600 p-3 rounded-full">
                  <MapPinIcon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold">Location</h4>
                  <p>Washington, D.C.</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h4 className="text-xl font-semibold mb-4">Follow Me</h4>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/Jeff.Jackson.Jr829"
                  className="bg-gray-800 hover:bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center transition duration-300"
                >
                  <span className="sr-only">Facebook</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/jeffjackson_jr"
                  className="bg-gray-800 hover:bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center transition duration-300"
                >
                  <span className="sr-only">Instagram</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}