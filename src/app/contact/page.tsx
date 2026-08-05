'use client';

import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  Loader2,
  MessageSquare,
  Users,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    details: 'hello@learningplatform.com',
    sub: 'support@learningplatform.com',
    action: 'mailto:hello@learningplatform.com',
  },
  {
    icon: Phone,
    title: 'Phone',
    details: '+1 (234) 567-8900',
    sub: 'Mon-Fri 9AM-6PM EST',
    action: 'tel:+12345678900',
  },
  {
    icon: MapPin,
    title: 'Location',
    details: '123 Learning Street',
    sub: 'Education City, 10001',
    action: '#',
  },
  {
    icon: Clock,
    title: 'Working Hours',
    details: 'Monday - Friday',
    sub: '9:00 AM - 6:00 PM EST',
    action: '#',
  },
];

const stats = [
  { icon: Users, label: 'Active Students', value: '50K+' },
  { icon: GraduationCap, label: 'Courses', value: '200+' },
  { icon: MessageSquare, label: 'Community Members', value: '25K+' },
  { icon: Sparkles, label: 'Success Rate', value: '94%' },
];

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });

    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className='min-h-screen bg-linear-to-b from-white to-slate-50/80 py-12 sm:py-16 lg:py-20'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='text-center'>
          <div className='inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-600'>
            <Mail className='h-4 w-4' />
            Get in Touch
          </div>
          <h1 className='mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl'>
            Let&apos;s Connect
          </h1>
          <p className='mx-auto mt-4 max-w-2xl text-lg text-slate-500'>
            Have questions about our platform? We&apos;re here to help. Reach out to
            us and we&apos;ll get back to you within 24 hours.
          </p>
        </div>

        {/* Stats */}
        <div className='mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4'>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className='rounded-2xl border border-slate-200/60 bg-white/50 px-4 py-6 text-center backdrop-blur-sm transition hover:border-indigo-200 hover:shadow-md'
              >
                <Icon className='mx-auto h-6 w-6 text-indigo-500' />
                <p className='mt-2 text-xl font-bold text-slate-900'>
                  {stat.value}
                </p>
                <p className='text-sm text-slate-500'>{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className='mt-16 grid gap-8 lg:grid-cols-2'>
          {/* Contact Form */}
          <div className='rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8'>
            <h2 className='text-2xl font-bold text-slate-900'>
              Send us a message
            </h2>
            <p className='mt-1 text-sm text-slate-500'>
              We&apos;ll respond within 24 hours of receiving your message.
            </p>

            {isSubmitted ? (
              <div className='mt-8 rounded-xl border border-emerald-200 bg-emerald-50/50 p-6 text-center'>
                <CheckCircle className='mx-auto h-12 w-12 text-emerald-500' />
                <h3 className='mt-4 text-lg font-semibold text-emerald-700'>
                  Message sent successfully!
                </h3>
                <p className='mt-1 text-sm text-emerald-600'>
                  We&apos;ll get back to you as soon as possible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className='mt-6 space-y-5'>
                <div>
                  <label
                    htmlFor='name'
                    className='block text-sm font-medium text-slate-700'
                  >
                    Full Name
                  </label>
                  <input
                    type='text'
                    id='name'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className='mt-1.5 block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                    placeholder='John Doe'
                  />
                </div>

                <div>
                  <label
                    htmlFor='email'
                    className='block text-sm font-medium text-slate-700'
                  >
                    Email Address
                  </label>
                  <input
                    type='email'
                    id='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className='mt-1.5 block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                    placeholder='john@example.com'
                  />
                </div>

                <div>
                  <label
                    htmlFor='subject'
                    className='block text-sm font-medium text-slate-700'
                  >
                    Subject
                  </label>
                  <input
                    type='text'
                    id='subject'
                    name='subject'
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className='mt-1.5 block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                    placeholder='How can we help?'
                  />
                </div>

                <div>
                  <label
                    htmlFor='message'
                    className='block text-sm font-medium text-slate-700'
                  >
                    Message
                  </label>
                  <textarea
                    id='message'
                    name='message'
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className='mt-1.5 block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                    placeholder='Tell us more about your inquiry...'
                  />
                </div>

                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-indigo-600 to-indigo-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-200/50 transition hover:shadow-indigo-300/50 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70'
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='h-5 w-5 animate-spin' />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className='h-4 w-4' />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Information */}
          <div>
            <div className='grid gap-4'>
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <a
                    key={index}
                    href={item.action}
                    className='group flex items-start gap-4 rounded-2xl border border-slate-200/60 bg-white/50 p-5 transition hover:border-indigo-200 hover:bg-white hover:shadow-md'
                  >
                    <div className='rounded-xl bg-indigo-50 p-3 text-indigo-600 group-hover:bg-indigo-100'>
                      <Icon className='h-5 w-5' />
                    </div>
                    <div>
                      <h3 className='text-sm font-semibold text-slate-900'>
                        {item.title}
                      </h3>
                      <p className='text-sm font-medium text-slate-700'>
                        {item.details}
                      </p>
                      <p className='text-sm text-slate-500'>{item.sub}</p>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Social Proof / FAQ Quick Link */}
            <div className='mt-6 rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50/80 to-indigo-100/50 p-6'>
              <div className='flex items-center gap-3'>
                <MessageSquare className='h-5 w-5 text-indigo-600' />
                <h3 className='font-semibold text-indigo-900'>FAQ</h3>
              </div>
              <p className='mt-2 text-sm text-indigo-700/80'>
                Check our comprehensive{' '}
                <Link
                  href='/faq'
                  className='font-medium underline underline-offset-2 hover:text-indigo-900'
                >
                  FAQ page
                </Link>{' '}
                for quick answers to common questions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
