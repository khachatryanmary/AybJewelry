import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';

const toastStyles = `
  @media (max-width: 639px) {
    .Toastify__toast {
      width: 280px;
      font-size: 14px;
      padding: 8px 12px;
      line-height: 1.4;
    }
    .Toastify__toast-body {
      padding: 4px;
    }
    .Toastify__close-button {
      font-size: 14px;
    }
  }
  @media (min-width: 640px) and (max-width: 767px) {
    .Toastify__toast {
      width: 320px;
      font-size: 15px;
      padding: 10px 14px;
      line-height: 1.5;
    }
    .Toastify__toast-body {
      padding: 6px;
    }
    .Toastify__close-button {
      font-size: 15px;
    }
  }
  @media (min-width: 768px) {
    .Toastify__toast {
      width: 360px;
      font-size: 16px;
      padding: 12px 16px;
      line-height: 1.5;
    }
    .Toastify__toast-body {
      padding: 8px;
    }
    .Toastify__close-button {
      font-size: 16px;
    }
  }
`;

const Contact = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            toast.error(t('contact.formError', { defaultValue: 'Please fill in all fields' }));
            return;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error(t('contact.emailError', { defaultValue: 'Please enter a valid email' }));
            return;
        }

        setSubmitting(true);
        try {
            await axios.post(`${API_URL}/api/contact`, formData);
            toast.success(t('contact.success', { defaultValue: 'Message sent successfully!' }));
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error('Contact.jsx submit error:', error.message);
            toast.error(t('contact.submitError', { defaultValue: 'Failed to send message' }));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-[70vh] sm:min-h-[80vh] md:min-h-[85vh] w-[95%] sm:w-[90%] md:w-[85%] mx-auto my-[12px] sm:my-[16px] md:my-[20px]">
            <style>{toastStyles}</style>
            <div className="text-center font-[Against]">
                <h2 className="text-[24px] sm:text-[28px] md:text-[32px] text-[#0a0a39]">
                    {t('contact.contactTitle', { defaultValue: 'Contact Us' })}
                </h2>
            </div>

            <div className="mt-[16px] sm:mt-[20px] md:mt-[24px] bg-[#efeeee] flex flex-col lg:flex-row justify-between items-start gap-[12px] sm:gap-[16px] md:gap-[20px] p-[16px] sm:p-[24px] md:p-[32px] rounded-[8px]">
                {/* Left Info */}
                <div className="flex flex-col gap-[12px] sm:gap-[16px] md:gap-[20px] text-[14px] sm:text-[16px] md:text-[18px]">
                    <div className="space-y-1">
                        <h2 className="text-[#0a0a39] font-semibold text-[16px] sm:text-[18px] md:text-[20px]">
                            {t('contact.address', { defaultValue: 'Address' })}
                        </h2>
                        <div>
                            <i className="bi bi-geo-alt text-[14px] sm:text-[16px] md:text-[18px] pr-[8px] sm:pr-[10px] md:pr-[12px]" />
                            <span>{t('contact.addressText', { defaultValue: '123 Jewelry Lane, Yerevan, Armenia' })}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-[#0a0a39] font-semibold text-[16px] sm:text-[18px] md:text-[20px]">
                            {t('contact.phone', { defaultValue: 'Phone' })}
                        </h2>
                        <p>
                            <i className="bi bi-telephone text-[14px] sm:text-[16px] md:text-[18px] pr-[8px] sm:pr-[10px] md:pr-[12px]" />
                            <a href="tel:+37455067198">+374 55 067198</a>
                        </p>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-[#0a0a39] font-semibold text-[16px] sm:text-[18px] md:text-[20px]">
                            {t('contact.email', { defaultValue: 'Email' })}
                        </h2>
                        <p>
                            <i className="bi bi-envelope text-[14px] sm:text-[16px] md:text-[18px] pr-[8px] sm:pr-[10px] md:pr-[12px]" />
                            <a href="mailto:marykhachatryan01@gmail.com">marykhachatryan01@gmail.com</a>
                        </p>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-[#0a0a39] font-semibold text-[16px] sm:text-[18px] md:text-[20px]">
                            {t('contact.hours', { defaultValue: 'Working Hours' })}
                        </h2>
                        <div>
                            <i className="bi bi-clock text-[14px] sm:text-[16px] md:text-[18px] pr-[8px] sm:pr-[10px] md:pr-[12px]" />
                            <span>{t('contact.hoursText', { defaultValue: 'Mon-Sat: 10:00 AM - 6:00 PM' })}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-[#0a0a39] font-semibold text-[16px] sm:text-[18px] md:text-[20px]">
                            {t('contact.follow', { defaultValue: 'Follow Us' })}
                        </h2>
                        <div className="flex gap-[16px] sm:gap-[20px] md:gap-[24px] text-[20px] sm:text-[22px] md:text-[24px]">
                            <a href="https://facebook.com/aybjewelry" target="_blank" rel="noopener noreferrer">
                                <i className="bi bi-facebook hover:text-[#0a0a39]" />
                            </a>
                            <a href="https://instagram.com/aybjewelry" target="_blank" rel="noopener noreferrer">
                                <i className="bi bi-instagram hover:text-[#0a0a39]" />
                            </a>
                            <a href="https://wa.me/+37455067198" target="_blank" rel="noopener noreferrer">
                                <i className="bi bi-whatsapp hover:text-[#0a0a39]" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right Info */}
                <div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[500px]">
                    <form className="flex flex-col gap-[12px] sm:gap-[16px] md:gap-[20px]" onSubmit={handleSubmit}>
                        <h2 className="text-[#0a0a39] font-semibold text-[18px] sm:text-[20px] md:text-[22px]">
                            {t('contact.formTitle', { defaultValue: 'Send Us a Message' })}
                        </h2>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t('contact.namePlaceholder', { defaultValue: 'Your Name' })}
                            className="p-[8px] sm:p-[10px] md:p-[12px] h-[36px] sm:h-[40px] md:h-[44px] w-full border border-gray-400 rounded-[8px] text-[14px] sm:text-[15px] md:text-[16px] focus:outline-none focus:border-[#0a0a39]"
                        />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t('contact.emailPlaceholder', { defaultValue: 'Your Email' })}
                            className="p-[8px] sm:p-[10px] md:p-[12px] h-[36px] sm:h-[40px] md:h-[44px] w-full border border-gray-400 rounded-[8px] text-[14px] sm:text-[15px] md:text-[16px] focus:outline-none focus:border-[#0a0a39]"
                        />
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder={t('contact.messagePlaceholder', { defaultValue: 'Your Message' })}
                            className="p-[8px] sm:p-[10px] md:p-[12px] h-[120px] sm:h-[140px] md:h-[160px] w-full border border-gray-400 rounded-[8px] text-[14px] sm:text-[15px] md:text-[16px] focus:outline-none focus:border-[#0a0a39]"
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`bg-white border-none rounded-[12px] h-[36px] sm:h-[40px] md:h-[44px] w-full transition duration-500 hover:text-white hover:bg-[#0a0a39] py-[8px] sm:py-[10px] md:py-[12px] font-semibold text-[14px] sm:text-[15px] md:text-[16px] ${
                                submitting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {t('contact.button', { defaultValue: 'Send Message' })}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;