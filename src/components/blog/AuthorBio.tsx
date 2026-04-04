import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Linkedin, Mail, ExternalLink } from 'lucide-react';
import type { BlogAuthor } from '@/types/blog';

interface AuthorBioProps {
  author: Partial<BlogAuthor>;
}

export const AuthorBio: React.FC<AuthorBioProps> = ({ author }) => {
  if (!author || !author.name) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-white/80 to-slate-50/50 border border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-sm relative overflow-hidden"
    >
      {/* Декоративный элемент фона */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
      
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
        {/* Аватар с премиальной обводкой */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img
              src={author.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250'}
              alt={author.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full shadow-md">
            <ExternalLink size={14} />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{author.name}</h3>
              <p className="text-blue-600 font-medium text-sm lg:text-base">
                {author.specialization || 'Эксперт Считай.RU'}
              </p>
            </div>
            
            {/* Социальные сети */}
            <div className="flex items-center justify-center md:justify-start gap-3">
              {author.social?.twitter && (
                <a href={author.social.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all">
                  <Twitter size={18} />
                </a>
              )}
              {author.social?.linkedin && (
                <a href={author.social.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-700 hover:text-white transition-all">
                  <Linkedin size={18} />
                </a>
              )}
              {author.social?.email && (
                <a href={`mailto:${author.social.email}`} className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all">
                  <Mail size={18} />
                </a>
              )}
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed mb-6 text-base italic">
            "{author.bio || 'Ведущий эксперт нашего портала, специализирующийся на финансовых расчетах и аналитике.'}"
          </p>

          {/* Теги компетенций */}
          {author.expertise && author.expertise.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {author.expertise.map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider border border-blue-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
