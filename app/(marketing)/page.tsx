"use client"

import { useState } from "react"
import { Hero } from "@/components/marketing/hero"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { ContactForm } from "@/components/marketing/contact-form"
import { AccordionItem } from "@/components/ui/accordion-motion"

export default function IndexPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <>
      <Hero />
      <section id="information" className="min-h-screen flex flex-col items-center justify-center container py-12">
        <ScrollReveal width="100%">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Informasi
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Informasi dan pengumuman terkait penilaian 360 derajat.
            </p>
          </div>
        </ScrollReveal>

        {/* Placeholder for Information/News Grid */}
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 mt-8">
          <ScrollReveal delay={0.1}>
            <SpotlightCard className="h-full bg-background border-border">
              <div className="flex h-[180px] flex-col justify-between p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">Periode Penilaian</h3>
                  <p className="text-sm text-muted-foreground">Periode penilaian kinerja pegawai dibuka mulai tanggal 1 - 10 setiap bulannya.</p>
                </div>
              </div>
            </SpotlightCard>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <SpotlightCard className="h-full bg-background border-border">
              <div className="flex h-[180px] flex-col justify-between p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">Tata Cara</h3>
                  <p className="text-sm text-muted-foreground">Panduan lengkap mengenai tata cara pengisian penilaian 360 derajat.</p>
                </div>
              </div>
            </SpotlightCard>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <SpotlightCard className="h-full bg-background border-border">
              <div className="flex h-[180px] flex-col justify-between p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">Bantuan</h3>
                  <p className="text-sm text-muted-foreground">Hubungi admin jika mengalami kendala teknis dalam pengisian.</p>
                </div>
              </div>
            </SpotlightCard>
          </ScrollReveal>
        </div>
      </section>

      <section id="faq" className="min-h-screen flex flex-col items-center justify-center container py-12">
        <ScrollReveal width="100%">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              FAQ
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Pertanyaan yang sering diajukan.
            </p>
          </div>
        </ScrollReveal>
        <div className="mx-auto max-w-[58rem] mt-8 space-y-4 w-full">
          <ScrollReveal delay={0.1} width="100%">
            <AccordionItem
              title="Apakah penilaian ini anonim?"
              isOpen={openIndex === 0}
              onClick={() => handleToggle(0)}
            >
              Ya, penilaian dilakukan secara <strong>rahasia dan anonim</strong>. Identitas penilai tidak akan ditampilkan kepada pegawai yang dinilai untuk menjaga objektivitas dan kenyamanan dalam memberikan umpan balik yang jujur.
            </AccordionItem>
          </ScrollReveal>

          <ScrollReveal delay={0.2} width="100%">
            <AccordionItem
              title="Siapa saja yang harus saya nilai?"
              isOpen={openIndex === 1}
              onClick={() => handleToggle(1)}
            >
              Anda diwajibkan untuk menilai <strong>seluruh pegawai</strong> yang terdaftar dalam satu unit kerja (UKPBJ), terkecuali diri Anda sendiri. Sistem akan otomatis menampilkan daftar rekan kerja yang perlu Anda nilai.
            </AccordionItem>
          </ScrollReveal>

          <ScrollReveal delay={0.3} width="100%">
            <AccordionItem
              title="Bagaimana sistem penilaian BerAKHLAK?"
              isOpen={openIndex === 2}
              onClick={() => handleToggle(2)}
            >
              Setiap aspek BerAKHLAK dinilai menggunakan skala bintang 1 sampai 5. Nilai dikonversi otomatis: <br />
              ★ 1 = 20 (Sangat Kurang)<br />
              ★ 2 = 40 (Kurang)<br />
              ★ 3 = 60 (Cukup)<br />
              ★ 4 = 80 (Baik)<br />
              ★ 5 = 100 (Sangat Baik)
            </AccordionItem>
          </ScrollReveal>
        </div>
      </section>

      <section id="contact" className="min-h-screen flex flex-col items-center justify-center container py-12">
        <ScrollReveal width="100%">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Hubungi Kami
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Memiliki pertanyaan atau kendala? Kirimkan pesan kepada kami.
            </p>
          </div>
        </ScrollReveal>

        <div className="mx-auto w-full max-w-[500px] mt-12">
          <ScrollReveal delay={0.2} width="100%">
            <ContactForm />
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
