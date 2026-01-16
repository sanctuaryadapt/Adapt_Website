'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail, Instagram, Youtube } from 'lucide-react'

// Define types locally

type Product = { id: string; title: string; tagline?: string; description: string; image: string; imageFit?: any; imagePosition?: string }

type Research = { id: string; title: string; description: string; image: string; imageFit?: any; imagePosition?: string }
type Blog = { id: string; title: string; excerpt: string; image: string; imageFit?: any; imagePosition?: string; slug?: string }

export default function HomeClient({
    initialProducts,
    initialResearch,
    initialBlogs
}: {
    initialProducts: Product[],
    initialResearch: Research[],
    initialBlogs: Blog[]
}) {
    // Intro State
    const [introPhase, setIntroPhase] = useState<'start' | 'text1' | 'text2' | 'text3' | 'final'>('start')

    // Sequence Logic
    useEffect(() => {
        // Phase 1: Hello.
        const t1 = setTimeout(() => setIntroPhase('text1'), 500)
        // Phase 2: I'm tBot.
        const t2 = setTimeout(() => setIntroPhase('text2'), 2000)
        // Phase 3: It sure is great...
        const t3 = setTimeout(() => setIntroPhase('text3'), 3500)
        // Phase 4: Final Motto (Gaze Beyond Possible)
        const t4 = setTimeout(() => setIntroPhase('final'), 6000)

        return () => {
            clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
        }
    }, [])


    const smoothScrollTo = (element: HTMLElement, duration: number) => {
        const targetPosition = element.getBoundingClientRect().top + window.scrollY
        const startPosition = window.scrollY
        const distance = targetPosition - startPosition
        let startTime: number | null = null

        const animation = (currentTime: number) => {
            if (startTime === null) startTime = currentTime
            const timeElapsed = currentTime - startTime

            // Easing function (easeInOutCubic)
            const ease = (t: number) => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1

            const run = ease(timeElapsed / duration) * distance + startPosition
            window.scrollTo(0, run)

            if (timeElapsed < duration) {
                requestAnimationFrame(animation)
            }
        }

        requestAnimationFrame(animation)
    }

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            smoothScrollTo(element, 1000)
        }
    }

    return (
        <main className="min-h-screen bg-white font-sans text-brand antialiased selection:bg-brand selection:text-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-white/0 px-8 py-6 transition-all hover:bg-white/95 md:px-12 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <img src="/assets/pics/AdaptLogo.png" alt="Adapt Robotics Logo" className="h-10 w-auto rounded-full" />
                    <span className="text-xl font-bold tracking-tight text-brand">Adapt Robotics</span>
                </div>

                <nav className="hidden md:block">
                    <ul className="flex items-center gap-8 text-sm font-medium text-brand/80">
                        <li><button onClick={() => scrollToSection('products')} className="hover:text-brand hover:underline underline-offset-4 transition-all">Products</button></li>
                        {/* <li><button onClick={() => scrollToSection('research')} className="hover:text-brand hover:underline underline-offset-4 transition-all">Research</button></li> */}
                        <li><button onClick={() => scrollToSection('blogs')} className="hover:text-brand hover:underline underline-offset-4 transition-all">Blogs</button></li>
                        <li><button onClick={() => scrollToSection('about')} className="hover:text-brand hover:underline underline-offset-4 transition-all">About Us</button></li>
                    </ul>
                </nav>
            </header>

            {/* Main Content */}
            <div className="flex flex-col">

                {/* Motto Section (Embedded Intro) */}
                <section className="flex h-screen w-full flex-col items-center justify-center bg-white px-6 text-center relative overflow-hidden">
                    <div className="relative flex flex-col items-center justify-center h-full w-full max-w-4xl mx-auto">
                        <AnimatePresence mode="wait">
                            {introPhase !== 'final' ? (
                                <div className="flex flex-col items-center gap-6">
                                    {/* Text 1: Hello. */}
                                    {(introPhase === 'text1' || introPhase === 'text2' || introPhase === 'text3') && (
                                        <motion.h1
                                            layout
                                            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                                            animate={{
                                                opacity: introPhase === 'text1' ? 1 : 0.2,
                                                y: introPhase === 'text1' ? 0 : -20, // Move up when not active
                                                filter: introPhase === 'text1' ? 'blur(0px)' : 'blur(2px)',
                                                scale: introPhase === 'text1' ? 1 : 0.9
                                            }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="text-4xl md:text-6xl font-light text-brand"
                                        >
                                            Hello.
                                        </motion.h1>
                                    )}

                                    {/* Text 2: I'm tBot. */}
                                    {(introPhase === 'text2' || introPhase === 'text3') && (
                                        <motion.h1
                                            layout
                                            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                                            animate={{
                                                opacity: introPhase === 'text2' ? 1 : 0.2,
                                                y: introPhase === 'text2' ? 0 : -20,
                                                filter: introPhase === 'text2' ? 'blur(0px)' : 'blur(2px)',
                                                scale: introPhase === 'text2' ? 1 : 0.9
                                            }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="text-4xl md:text-6xl font-light text-brand"
                                        >
                                            I'm tBot.
                                        </motion.h1>
                                    )}

                                    {/* Text 3: It sure is... */}
                                    {introPhase === 'text3' && (
                                        <motion.h1
                                            layout
                                            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="text-3xl md:text-5xl font-light text-brand leading-tight max-w-2xl text-center"
                                        >
                                            It sure is great to get out of that bag.
                                        </motion.h1>
                                    )}
                                </div>
                            ) : (
                                <motion.h1
                                    key="final"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                    className="text-4xl font-bold md:text-7xl tracking-tighter text-brand text-center"
                                >
                                    Gaze Beyond Possible.
                                </motion.h1>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Scroll Indicator (Only show at final state) */}
                    {introPhase === 'final' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            transition={{ delay: 1 }}
                            className="absolute bottom-12 animate-bounce"
                        >
                            <div className="w-px h-12 bg-brand/30 mx-auto"></div>
                        </motion.div>
                    )}
                </section>

                {/* Products (Dynamic) */}
                <section id="products" className="w-full">
                    {initialProducts.map((product) => (
                        <div key={product.id} className="relative min-h-[90vh] w-full group overflow-hidden border-t-2 border-white">
                            <div className="absolute inset-0 bg-brand/5">
                                {/* If image exists, show it, else show placeholder text */}
                                {product.image && !product.image.includes('placeholder') ? (
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="w-full h-full transition-transform duration-700 group-hover:scale-105"
                                        style={{
                                            objectFit: product.imageFit || 'cover',
                                            objectPosition: product.imagePosition || 'center'
                                        }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105 flex items-center justify-center">
                                        <div className="text-brand/10 transform rotate-12 scale-150 font-black text-9xl select-none">
                                            {product.title}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Blue Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-brand/95 via-brand/40 to-transparent opacity-90" />

                            <Link href={`/products/${product.id}`} className="absolute bottom-0 left-0 w-full p-12 md:p-24 text-white hover:text-white/90 transition-colors">
                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.8 }}
                                    viewport={{ once: true }}
                                >
                                    <h2 className="text-6xl font-black mb-4 md:text-8xl">{product.title}</h2>
                                    <p className="text-xl md:text-3xl font-light text-white/90 mb-4">{product.tagline}</p>
                                    <p className="max-w-xl text-lg md:text-xl font-light opacity-80 leading-relaxed">
                                        {product.description}
                                    </p>
                                </motion.div>
                            </Link>
                        </div>
                    ))}
                </section>

                {/* Research (Dynamic) - COMMENTED OUT
                <section id="research" className="py-32 px-6 md:px-12 bg-white text-brand">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="mb-12 text-3xl font-bold md:text-5xl border-l-4 border-brand pl-6">Research</h2>
                        <div className="grid gap-8 sm:grid-cols-2">
                            {initialResearch.map((item) => (
                                <Link key={item.id} href={`/research/${item.id}`} className="group block">
                                    <div className="aspect-[4/3] w-full bg-brand/5 rounded-sm mb-4 relative overflow-hidden ring-1 ring-brand/10">
                                        {item.image &&
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full absolute inset-0 transition-transform group-hover:scale-105"
                                                style={{
                                                    objectFit: item.imageFit || 'cover',
                                                    objectPosition: item.imagePosition || 'center'
                                                }}
                                            />
                                        }
                                        {!item.image && (
                                            <div className="absolute inset-0 flex items-center justify-center text-brand/20 font-bold text-4xl">
                                                {item.title[0]}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-bold group-hover:text-brand/80 transition-colors">{item.title}</h3>
                                    <p className="text-brand/60 mt-2">{item.description}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
                */}

                {/* Blogs (Dynamic) */}
                <section id="blogs">
                    {initialBlogs.map((blog) => (
                        <div key={blog.id} className="relative min-h-[60vh] w-full group overflow-hidden border-b border-brand/10">
                            <div className="absolute inset-0 bg-brand/5 transition-transform duration-700 group-hover:scale-105">
                                {blog.image ? (
                                    <img
                                        src={blog.image}
                                        alt={blog.title}
                                        className="w-full h-full"
                                        style={{
                                            objectFit: blog.imageFit || 'cover',
                                            objectPosition: blog.imagePosition || 'center'
                                        }}
                                    />
                                ) : null}
                            </div>
                            <div className="absolute inset-0 bg-white/[0.85] group-hover:bg-white/95 transition-colors" />

                            <Link href={`/blogs/${blog.slug || blog.id}`} className="absolute inset-0 flex flex-col justify-center items-center text-center p-12 text-brand">
                                <span className="mb-4 text-xs font-bold uppercase tracking-widest text-brand/40">Blog Post</span>
                                <h2 className="text-4xl font-black md:text-5xl max-w-4xl hover:underline decoration-brand/20 decoration-2 underline-offset-8">
                                    {blog.title}
                                </h2>
                                <p className="mt-6 max-w-2xl text-lg text-brand/70 font-light">
                                    {blog.excerpt}
                                </p>
                            </Link>
                        </div>
                    ))}
                </section>

                {/* About Us */}
                <section id="about" className="bg-brand text-white py-24 px-6 md:px-12 text-center relative overflow-hidden">
                    <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                        <h2 className="text-3xl font-bold mb-8">About Us</h2>
                        <p className="text-xl leading-relaxed opacity-90 font-light mb-12">
                            Adapt Robotics started with a simple question: How can we make machines truly adaptive?
                            From humble beginnings from developing remote control cars and operating farming motors to pioneering breakthroughs in autonomous systems.
                        </p>

                        {/* Social Media & Incubator */}
                        <div className="flex flex-col items-center gap-8 mt-4 w-full">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-white/40">Incubated at</span>
                                <div className="bg-white p-4 rounded-xl">
                                    <img src="/assets/pics/incubation_logo.png" alt="Incubation Partner" className="h-16 w-auto object-contain" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Us Section */}
                <section id="contact" className="w-full bg-white relative py-20 px-4 md:px-12 flex items-center justify-center">
                    <div className="w-full max-w-6xl shadow-2xl rounded-3xl overflow-hidden bg-white flex flex-col md:flex-row min-h-[600px]">
                        {/* Left: Form */}
                        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-brand mb-8 uppercase tracking-wide">Contact Us!</h2>
                            <ContactForm />
                        </div>

                        {/* Right: Info Card */}
                        <div className="md:w-[400px] bg-brand text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
                            {/* Decorative Circle */}
                            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

                            <div>
                                <h3 className="text-2xl font-bold mb-8">Office Address</h3>
                                <div className="space-y-6 text-white/90 font-light text-sm md:text-base">
                                    <p className="leading-relaxed">
                                        H-Block, SRI SAIRAM ENGINEERING
                                        COLLEGE, Campus, Sai Leo Nagar, West
                                        Tambaram, Chennai, Sirukalathur, Tamil
                                        Nadu 600044
                                    </p>
                                </div>

                                <div className="mt-12 space-y-2">
                                    <h3 className="text-xl font-bold">Call Us</h3>
                                    <p className="text-white/80">+91 72002 80982</p>
                                </div>

                                <div className="mt-8 space-y-2">
                                    <h3 className="text-xl font-bold">Send an E-mail</h3>
                                    <p className="text-white/80">sanctuaryadapt@gmail.com</p>
                                </div>
                            </div>

                            {/* Social Icons */}
                            <div className="flex gap-4 mt-12">
                                <Link href="https://www.linkedin.com/company/adaptrobotics" className="bg-white text-brand p-2 rounded-full hover:scale-110 transition-transform"><Linkedin size={20} /></Link>
                                <Link href="https://youtube.com/@adapt_automation_official?si=bUFiGtjvODZfDo5I" className="bg-white text-brand p-2 rounded-full hover:scale-110 transition-transform"><Youtube size={20} /></Link>
                                <Link href="https://www.instagram.com/adapt_automation" className="bg-white text-brand p-2 rounded-full hover:scale-110 transition-transform"><Instagram size={20} /></Link>
                                <Link href="https://github.com/sanctuaryadapt" className="bg-white text-brand p-2 rounded-full hover:scale-110 transition-transform"><Github size={20} /></Link>
                            </div>
                        </div>
                    </div>
                </section>

            </div>

            {/* Footer */}
            <footer className="bg-white py-8 px-6 md:px-12 border-t border-brand/5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-brand">
                    <span className="text-lg font-bold">Adapt Robotics</span>
                    <p className="text-sm opacity-60">© 2025 Adapt Robotics Inc.</p>
                </div>
            </footer>
        </main>
    )
}

function ContactForm() {
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setStatus('sending')
        const formData = new FormData(e.currentTarget)
        const data = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            message: formData.get('message')
        }

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (res.ok) {
                setStatus('success')
                // e.currentTarget.reset() // Optional: reset form
            } else {
                setStatus('error')
            }
        } catch (error) {
            setStatus('error')
        }
    }

    if (status === 'success') {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-green-50 rounded-xl border border-green-100 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Message Sent!</h3>
                <p className="text-green-600">We'll get back to you shortly.</p>
                <button onClick={() => setStatus('idle')} className="mt-6 text-sm text-green-700 underline hover:text-green-900">Send another</button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">First Name*</label>
                    <input name="firstName" required className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand/10 transition-all" placeholder="John" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Last Name*</label>
                    <input name="lastName" required className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand/10 transition-all" placeholder="Doe" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Email*</label>
                <input name="email" type="email" required className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand/10 transition-all" placeholder="john@example.com" />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Message*</label>
                <textarea name="message" required rows={4} className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand/10 transition-all resize-none" placeholder="How can we help you?" />
            </div>

            <button
                disabled={status === 'sending'}
                className="w-full py-4 bg-brand/60 text-white font-bold tracking-wider uppercase rounded-lg hover:bg-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
                {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
            {status === 'error' && <p className="text-red-500 text-sm text-center">Something went wrong. Please try again.</p>}
        </form>
    )
}
