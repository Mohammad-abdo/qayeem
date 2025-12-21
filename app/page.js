"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "react-i18next";
import { booksAPI } from "@/lib/api";
import { getBookTitle, getBookDescription, getBookCategory } from "@/lib/translations";
import Link from "next/link";
import { BookOpen, Target, TrendingUp, Edit, Check, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchFeaturedBooks();
  }, []);

  const fetchFeaturedBooks = async () => {
    try {
      setLoadingBooks(true);
      const response = await booksAPI.getAll({
        status: 'ACTIVE',
        limit: 6,
      });
      setFeaturedBooks(response.data.books || []);
    } catch (error) {
      console.error('Error fetching featured books:', error);
      setFeaturedBooks([]);
    } finally {
      setLoadingBooks(false);
    }
  };

  // Website is separate from dashboard - users can browse even when logged in

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Navbar */}
      <Header currentPage="/" />

      <div className="h-16 sm:h-20 lg:h-24"></div> {/* Spacer for fixed header */}

      {/* Hero Section */}
      <section className="pt-8 sm:pt-12 md:pt-20 lg:pt-24 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 md:px-12 lg:px-20 flex items-center min-h-[500px] sm:min-h-[600px] md:min-h-[760px]">
        <div className="flex-1 flex flex-col md:flex-row gap-8 md:gap-20 items-center max-w-[1280px] mx-auto w-full">
          {/* Content Section */}
          <div className={`flex-1 flex flex-col gap-6 md:gap-8 items-start animate-slide-in-right opacity-0`} style={{ animationFillMode: 'forwards', alignItems: language === 'ar' ? 'flex-end' : 'flex-start' }}>
            <div className={`flex flex-col gap-4 ${language === 'ar' ? 'items-end' : 'items-start'}`}>
              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-black-500 leading-tight ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {t('home.hero.title')}{" "}
                <span className="text-primary-500">{t('home.hero.titleHighlight')}</span>
              </h1>
              <p className={`text-base sm:text-lg md:text-xl text-black-600 leading-relaxed ${language === 'ar' ? 'text-right' : 'text-left'} max-w-[688px]`}>
                {t('home.hero.description')}
              </p>
            </div>
            <Link
              href="/register"
              className="px-6 md:px-8 py-3 md:py-4 bg-primary-500 text-white text-base md:text-lg font-bold rounded-lg hover:bg-primary-400 transition-all duration-300 hover:scale-105"
            >
              {t('home.hero.cta')}
            </Link>
          </div>

          {/* Image Section */}
          <div className="relative w-full sm:w-[400px] md:w-[512px] h-[300px] sm:h-[400px] md:h-[512px] flex-shrink-0 animate-scale-in opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full blur-3xl opacity-50"></div>
            <div className="relative w-full h-full rounded-2xl  hover:scale-105 transition-all duration-300 overflow-hidden">
              <img
                src="/images/banar-home page.png"
                alt="نظام قيم"
                className="w-full h-full object-cover  hover:bg-primary-400 transition-colors "
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-primary-50 py-12 md:py-20 px-4 sm:px-8 md:px-20">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-black-500 text-center mb-8 md:mb-16 animate-fade-in opacity-0" style={{ animationFillMode: 'forwards' }}>
            {t('home.howItWorks.title')}<span className="text-primary-500"> {t('home.howItWorks.titleHighlight')}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Feature 1 */}
            <div className={`bg-white border border-black-50 rounded-2xl p-4 md:p-6 flex flex-col gap-4 md:gap-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up opacity-0 stagger-1`} style={{ animationFillMode: 'forwards', alignItems: language === 'ar' ? 'flex-start' : 'flex-start' }}>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#d3e7ff] rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 md:w-7 md:h-7 text-primary-500" />
              </div>
              <div className={`flex flex-col gap-2 ${language === 'ar' ? 'items-start text-right' : 'items-start text-left'}`}>
                <h3 className="text-lg md:text-xl font-semibold text-black-500">
                  {t('home.howItWorks.step4.title')}
                </h3>
                <p className="text-sm md:text-base text-black-600 leading-relaxed">
                  {t('home.howItWorks.step4.description')}
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className={`bg-white border border-black-50 rounded-2xl p-4 md:p-6 flex flex-col gap-4 md:gap-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up opacity-0 stagger-2`} style={{ animationFillMode: 'forwards', alignItems: language === 'ar' ? 'flex-start' : 'flex-start' }}>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#ffeeee] rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-primary-500" />
              </div>
              <div className={`flex flex-col gap-2 ${language === 'ar' ? 'items-start text-right' : 'items-start text-left'}`}>
                <h3 className="text-lg md:text-xl font-semibold text-black-500">
                  {t('home.howItWorks.step3.title')}
                </h3>
                <p className="text-sm md:text-base text-black-600 leading-relaxed">
                  {t('home.howItWorks.step3.description')}
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className={`bg-white border border-black-50 rounded-2xl p-4 md:p-6 flex flex-col gap-4 md:gap-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up opacity-0 stagger-3`} style={{ animationFillMode: 'forwards', alignItems: language === 'ar' ? 'flex-start' : 'flex-start' }}>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#fff1cf] rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-primary-500" />
              </div>
              <div className={`flex flex-col gap-2 ${language === 'ar' ? 'items-start text-right' : 'items-start text-left'}`}>
                <h3 className="text-lg md:text-xl font-semibold text-black-500">
                  {t('home.howItWorks.step2.title')}
                </h3>
                <p className="text-sm md:text-base text-black-600 leading-relaxed">
                  {t('home.howItWorks.step2.description')}
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className={`bg-white border border-black-50 rounded-2xl p-4 md:p-6 flex flex-col gap-4 md:gap-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up opacity-0 stagger-4`} style={{ animationFillMode: 'forwards', alignItems: language === 'ar' ? 'flex-start' : 'flex-start' }}>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-primary-50 rounded-lg flex items-center justify-center">
                <Edit className="w-6 h-6 md:w-7 md:h-7 text-primary-500" />
              </div>
              <div className={`flex flex-col gap-2 ${language === 'ar' ? 'items-start text-right' : 'items-start text-left'}`}>
                <h3 className="text-xl font-semibold text-black-500">
                  {t('home.howItWorks.step1.title')}
                </h3>
                <p className="text-base text-black-600 leading-relaxed">
                  {t('home.howItWorks.step1.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Qayeem Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Image Section */}
          <div className="flex-1 relative w-full">
            <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[628px] rounded-2xl overflow-hidden">
              <img
                src="/images/second-section-homepage.png"
                alt="لماذا نظام قيم"
                className="w-full h-full object-cover hover:bg-primary-400 transition-all duration-300 hover:scale-105"
              />
            </div>
          </div>

          <div className={`flex-1 flex flex-col gap-6 sm:gap-8 w-full ${language === 'ar' ? 'items-start' : 'items-start lg:items-end'}`}>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-black-500 w-full ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <span>{t('home.whyQayeem.title')} </span>
              <span className="text-primary-500">{t('home.whyQayeem.titleHighlight')}</span>
            </h2>

            <div className="flex flex-col gap-6 w-full">
              {[
                {
                  title: t('home.whyQayeem.benefit1.title'),
                  desc: t('home.whyQayeem.benefit1.description'),
                },
                {
                  title: t('home.whyQayeem.benefit2.title'),
                  desc: t('home.whyQayeem.benefit2.description'),
                },
                {
                  title: t('home.whyQayeem.benefit3.title'),
                  desc: t('home.whyQayeem.benefit3.description'),
                },
                {
                  title: t('home.whyQayeem.benefit4.title'),
                  desc: t('home.whyQayeem.benefit4.description'),
                },
              ].map((item, idx) => (
                <div key={idx} className={`flex gap-2 items-start ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`flex-1 flex flex-col gap-2 ${language === 'ar' ? 'items-start text-right' : 'items-start text-left'}`}>
                    <h3 className="text-lg font-semibold text-black-500">
                      {item.title}
                    </h3>
                    <p className="text-base text-black-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="w-6 h-6 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary-500" />
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/register"
              className={`px-6 sm:px-8 py-3 sm:py-4 bg-primary-500 text-white text-base sm:text-lg font-bold rounded-lg hover:bg-primary-400 transition-colors ${language === 'ar' ? 'self-end' : 'self-start'}`}
            >
              {t('home.whyQayeem.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="bg-primary-50 py-12 md:py-20 px-4 sm:px-8 md:px-20">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-8 md:mb-16 animate-fade-in opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.3s' }}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-black-500 mb-4">
              {t('home.featuredBooks.title')}
            </h2>
          </div>

          {loadingBooks ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : featuredBooks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-black-600">{t('library.noBooks')}</p>
            </div>
          ) : (
            <>
              {/* Mobile Carousel / Desktop Grid */}
              <div className="block md:hidden mb-6">
                <div className="overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
                  <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                    {featuredBooks.slice(0, 3).map((book, index) => (
                      <div 
                        key={book.id} 
                        className="flex-shrink-0 w-[calc(50%-0.5rem)] sm:w-[calc(50%-0.75rem)] bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover-scale animate-slide-up opacity-0 group"
                        style={{ animationFillMode: 'forwards', animationDelay: `${index * 0.1}s` }}
                      >
                        {/* Book Cover */}
                        <div className="h-48 sm:h-56 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center overflow-hidden group">
                          {book.coverImage ? (
                            <img
                              src={book.coverImage}
                              alt={getBookTitle(book, language) || (language === 'ar' ? 'كتاب' : 'Book')}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/object.png';
                              }}
                            />
                          ) : (
                            <img
                              src="/images/object.png"
                              alt={getBookTitle(book, language) || (language === 'ar' ? 'كتاب' : 'Book')}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          )}
                        </div>
                        {/* Book Details */}
                        <div className="p-3 sm:p-4">
                          <div className="flex items-end justify-end w-full gap-2 mb-2">
                            {book.category && (
                              <div className="bg-primary-50 px-2 py-1 rounded-lg text-primary-500 text-xs font-semibold whitespace-nowrap">
                                {getBookCategory(book, language)}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className={`text-sm sm:text-base font-semibold text-black-500 line-clamp-2 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                              {getBookTitle(book, language) || (language === 'ar' ? 'اسم الكتاب' : 'Book Title')}
                            </h3>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-lg sm:text-xl font-bold text-black-500">
                              {parseFloat(book.price).toFixed(0)} {language === 'ar' ? 'ج.م' : t('home.suggestedBooks.price')}
                            </p>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs sm:text-sm font-semibold text-black-500">
                                4.8
                              </span>
                            </div>
                          </div>
                          <Link
                            href={`/library/${book.id}`}
                            className="w-full px-4 py-2 bg-primary-500 text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-primary-400 transition-all duration-300 text-center block hover:scale-105"
                          >
                            {t('home.suggestedBooks.bookDetails')}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop Grid */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {featuredBooks.slice(0, 3).map((book, index) => (
                  <div 
                    key={book.id} 
                    className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover-scale animate-slide-up opacity-0 group"
                    style={{ animationFillMode: 'forwards', animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Book Cover */}
                    <div className="h-64 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center overflow-hidden group">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={getBookTitle(book, language) || (language === 'ar' ? 'كتاب' : 'Book')}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/object.png';
                          }}
                        />
                      ) : (
                        <img
                          src="/images/object.png"
                          alt={getBookTitle(book, language) || (language === 'ar' ? 'كتاب' : 'Book')}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      )}
                    </div>
                    {/* Book Details */}
                    <div className="p-4">
                      <div className="flex items-end justify-end w-full gap-3 mb-3">
                        {book.category && (
                          <div className="bg-primary-50 px-3 py-1 rounded-lg text-primary-500 text-xs font-semibold whitespace-nowrap">
                            {getBookCategory(book, language)}
                          </div>
                        )}
                      
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold text-black-500 flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          {getBookTitle(book, language) || (language === 'ar' ? 'اسم الكتاب' : 'Book Title')}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between my-10 gap-10 mb-2">
                  
                        <p className="text-2xl font-bold text-black-500">
                          {parseFloat(book.price).toFixed(0)} {language === 'ar' ? 'ج.م' : t('home.suggestedBooks.price')}
                        </p>
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-base font-semibold text-black-500">
                            4.8
                          </span>
                        </div>
                      </div>
                      <p className={`text-sm text-black-600 mb-4 line-clamp-2 min-h-[40px] ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {getBookDescription(book, language)}
                      </p>
                      <Link
                        href={`/library/${book.id}`}
                        className="w-full px-6 py-2 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-400 transition-all duration-300 text-center block hover:scale-105"
                      >
                        {t('home.suggestedBooks.bookDetails')}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {featuredBooks.length > 3 && (
                <>
                  {/* Mobile Carousel */}
                  <div className="block md:hidden">
                    <div className="overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
                      <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                        {featuredBooks.slice(3, 6).map((book, index) => (
                          <div 
                            key={book.id} 
                            className="flex-shrink-0 w-[calc(50%-0.5rem)] sm:w-[calc(50%-0.75rem)] bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up opacity-0"
                            style={{ animationFillMode: 'forwards', animationDelay: `${(index + 3) * 0.1}s` }}
                          >
                            {/* Book Cover */}
                            <div className="h-48 sm:h-56 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center overflow-hidden group">
                              {book.coverImage ? (
                                <img
                                  src={book.coverImage}
                                  alt={getBookTitle(book, language) || (language === 'ar' ? 'كتاب' : 'Book')}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/object.png';
                                  }}
                                />
                              ) : (
                                <img
                                  src="/images/object.png"
                                  alt={getBookTitle(book, language) || (language === 'ar' ? 'كتاب' : 'Book')}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                              )}
                            </div>
                            {/* Book Details */}
                            <div className="p-3 sm:p-4">
                              <div className="flex items-end justify-end w-full gap-2 mb-2">
                                {book.category && (
                                  <div className="bg-primary-50 px-2 py-1 rounded-lg text-primary-500 text-xs font-semibold whitespace-nowrap">
                                    {getBookCategory(book, language)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className={`text-sm sm:text-base font-semibold text-black-500 line-clamp-2 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                  {getBookTitle(book, language) || (language === 'ar' ? 'اسم الكتاب' : 'Book Title')}
                                </h3>
                              </div>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-lg sm:text-xl font-bold text-black-500">
                                  {parseFloat(book.price).toFixed(0)} {language === 'ar' ? 'ج.م' : t('home.suggestedBooks.price')}
                                </p>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs sm:text-sm font-semibold text-black-500">
                                    4.8
                                  </span>
                                </div>
                              </div>
                              <Link
                                href={`/library/${book.id}`}
                                className="w-full px-4 py-2 bg-primary-500 text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-primary-400 transition-all duration-300 text-center block hover:scale-105"
                              >
                                {t('home.suggestedBooks.bookDetails')}
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Grid */}
                  <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredBooks.slice(3, 6).map((book, index) => (
                      <div 
                        key={book.id} 
                        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up opacity-0"
                        style={{ animationFillMode: 'forwards', animationDelay: `${(index + 3) * 0.1}s` }}
                      >
                        {/* Book Cover */}
                        <div className="h-64 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center overflow-hidden group">
                          {book.coverImage ? (
                            <img
                              src={book.coverImage}
                              alt={getBookTitle(book, language) || (language === 'ar' ? 'كتاب' : 'Book')}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/object.png';
                              }}
                            />
                          ) : (
                            <img
                              src="/images/object.png"
                              alt={getBookTitle(book, language) || (language === 'ar' ? 'كتاب' : 'Book')}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          )}
                        </div>
                        {/* Book Details */}
                        <div className="p-4">
                          <div className="flex gap-3 items-end justify-end w-full mb-3">
                            {book.category && (
                              <div className="bg-primary-50 px-3 py-1 rounded-lg text-primary-500 text-xs font-semibold whitespace-nowrap">
                                {getBookCategory(book, language)}
                              </div>
                            )}
                          </div>
                          <div className="flex items-end justify-end w-full gap-3 mb-3">
                            <h3 className={`text-lg font-semibold text-black-500 flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                              {getBookTitle(book, language) || (language === 'ar' ? 'اسم الكتاب' : 'Book Title')}
                            </h3>
                          </div>
                          <div className="flex items-center justify-between my-10 gap-3 mb-2">
                            <p className="text-2xl font-bold text-black-500">
                              {parseFloat(book.price).toFixed(0)} {language === 'ar' ? 'ج.م' : t('home.suggestedBooks.price')}
                            </p>
                            <div className="flex items-center gap-1">
                              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                              <span className="text-base font-semibold text-black-500">
                                4.8
                              </span>
                            </div>
                          </div>
                          <p className={`text-sm text-black-600 mb-4 line-clamp-2 min-h-[40px] ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            {getBookDescription(book, language)}
                          </p>
                          <Link
                            href={`/library/${book.id}`}
                            className="w-full px-6 py-2 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-400 transition-all duration-300 text-center block hover:scale-105"
                          >
                            {t('home.suggestedBooks.bookDetails')}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-8 md:px-20">
        <div className="max-w-[1280px] mx-auto">
          <div className={`mb-12 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <h2 className={`text-5xl font-semibold text-black-500 mb-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {t('home.testimonials.title')} <span className="text-primary-500">{t('home.testimonials.titleHighlight')}</span>
            </h2>
            <p className={`text-xl text-black-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {t('home.testimonials.subtitle')}
            </p>
          </div>

          <div className={`flex gap-4 ${language === 'ar' ? 'justify-end' : 'justify-start'} overflow-x-auto pb-4`}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`bg-black-50 rounded-2xl p-8 flex flex-col gap-6 w-[398px] flex-shrink-0 ${language === 'ar' ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex flex-col gap-6 ${language === 'ar' ? 'items-end' : 'items-start'}`}>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-3 h-3 fill-accent-yellow text-accent-yellow"
                      />
                    ))}
                  </div>
                  <p className={`text-xl font-semibold text-black-500 leading-relaxed ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('home.testimonials.testimonial')}
                  </p>
                </div>
                <div className={`flex gap-4 items-center w-full ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                  <p className="text-base font-medium text-black-500">
                    أحمد محمد
                  </p>
                  <div className="w-12 h-12 bg-black-500 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
