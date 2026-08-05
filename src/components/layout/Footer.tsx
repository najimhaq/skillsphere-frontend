'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const socialLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/yourusername',
    icon: FaGithub,
    color: 'hover:text-slate-900',
  },
  {
    label: 'X / Twitter',
    href: 'https://x.com/yourusername',
    icon: FaTwitter,
    color: 'hover:text-sky-500',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/yourusername',
    icon: FaLinkedin,
    color: 'hover:text-blue-600',
  },
  {
    label: 'Discord',
    href: 'https://discord.gg/yourinvite',
    icon: MessageCircle,
    color: 'hover:text-indigo-500',
  },
];

const quickLinks = [
  { label: 'Courses', href: '/courses' },
  { label: 'About Us', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
];

const resources = [
  { label: 'Documentation', href: '/docs' },
  { label: 'Community', href: '/community' },
  { label: 'API Reference', href: '/api' },
  { label: 'Status', href: '/status' },
];

export default function Footer() {
  return (
    <footer className='mt-auto border-t border-slate-200/60 bg-linear-to-b from-white to-slate-50/80'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5'>
          {/* Brand Section */}
          <div className='lg:col-span-2'>
            <Link
              href='/'
              className='group inline-flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900'
            >
              <span className='relative grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-indigo-600 to-indigo-500 text-sm font-black text-white shadow-lg shadow-indigo-200/50 transition-transform group-hover:scale-105'>
                LP
                <span className='absolute -right-1 -top-1'>
                  <Sparkles className='h-3.5 w-3.5 text-indigo-400' />
                </span>
              </span>
              <span>Learning Platform</span>
            </Link>

            <p className='mt-4 max-w-sm text-sm leading-relaxed text-slate-500'>
              Empowering learners worldwide with practical skills, expert
              guidance, and a supportive community to help you achieve your
              goals.
            </p>

            <div className='mt-6 flex items-center gap-3'>
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label={`Visit our ${social.label}`}
                    className={`rounded-lg p-2.5 text-slate-400 transition-all duration-200 hover:bg-white hover:shadow-md ${social.color}`}
                  >
                    <Icon className='h-5 w-5' />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='text-sm font-semibold uppercase tracking-wider text-slate-900'>
              Quick Links
            </h3>
            <ul className='mt-4 space-y-3'>
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className='group inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-indigo-600'
                  >
                    {item.label}
                    <ArrowUpRight className='h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100' />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className='text-sm font-semibold uppercase tracking-wider text-slate-900'>
              Resources
            </h3>
            <ul className='mt-4 space-y-3'>
              {resources.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className='group inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-indigo-600'
                  >
                    {item.label}
                    <ArrowUpRight className='h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100' />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className='text-sm font-semibold uppercase tracking-wider text-slate-900'>
              Contact
            </h3>
            <ul className='mt-4 space-y-3'>
              <li>
                <a
                  href='mailto:hello@learningplatform.com'
                  className='flex items-center gap-2.5 text-sm text-slate-500 transition hover:text-indigo-600'
                >
                  <Mail className='h-4 w-4 shrink-0' />
                  hello@learningplatform.com
                </a>
              </li>
              <li>
                <a
                  href='tel:+1234567890'
                  className='flex items-center gap-2.5 text-sm text-slate-500 transition hover:text-indigo-600'
                >
                  <Phone className='h-4 w-4 shrink-0' />
                  +1 (234) 567-890
                </a>
              </li>
              <li className='flex items-start gap-2.5 text-sm text-slate-500'>
                <MapPin className='mt-0.5 h-4 w-4 shrink-0' />
                <span>
                  123 Learning St,
                  <br />
                  Education City, 10001
                </span>
              </li>
            </ul>

            {/* Trust Badge */}
            <div className='mt-5 rounded-xl border border-indigo-100 bg-indigo-50/80 px-3.5 py-3 backdrop-blur-sm'>
              <div className='flex items-center gap-2 text-sm font-semibold text-indigo-800'>
                <ShieldCheck className='h-4 w-4' />
                Secure & Trusted
              </div>
              <p className='mt-1 text-xs leading-relaxed text-indigo-700/80'>
                Your data and progress are always protected.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='mt-12 flex flex-col gap-4 border-t border-slate-200/60 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between'>
          <p>
            © {new Date().getFullYear()} Learning Platform. All rights reserved.
          </p>

          <div className='flex flex-wrap items-center gap-4'>
            <Link href='/privacy' className='transition hover:text-indigo-600'>
              Privacy Policy
            </Link>
            <Link href='/terms' className='transition hover:text-indigo-600'>
              Terms of Service
            </Link>
            <Link href='/cookies' className='transition hover:text-indigo-600'>
              Cookie Policy
            </Link>
          </div>

          <p className='flex items-center gap-1.5 text-slate-400'>
            Built with <Heart className='h-4 w-4 fill-rose-500 text-rose-500' />{' '}
            for better learning
          </p>
        </div>
      </div>
    </footer>
  );
}
