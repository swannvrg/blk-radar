'use client';
import React from 'react';
import { motion, Variants } from 'framer-motion';

const AboutMedia = ({ isPage = false }) => {
  const items = [
    {
      title: "C'EST QUOI BLK ?",
      desc: "On n'est pas là pour faire de la figuration. BLK RADAR, c'est l'outil qui scanne la street et la tech pour sortir les pépites avant tout le monde.",
      tag: "THE VISION",
      align: "left"
    },
    {
      title: "POUR NOUS, PAR NOUS.",
      desc: "Un collectif de créatifs et de devs qui en ont marre des annuaires classiques. On met en avant ceux qui bossent dans l'ombre.",
      tag: "THE SQUAD",
      align: "right"
    },
    {
      title: "ZÉRO BRUIT.",
      desc: "On retire le superflu. Tu veux un expert ? Tu veux un créatif ? Le radar te donne la position exacte. Précision chirurgicale.",
      tag: "THE METHOD",
      align: "left"
    },
    {
      title: "REJOINS LE MOUVE.",
      desc: "C'est une intelligence collective. Chaque profil est une force. On construit le réseau le plus puissant de la nouvelle génération.",
      tag: "THE GOAL",
      align: "right"
    }
  ];

  // Animation pour l'entrée globale
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  // Animation "Pop" avec effet Spring (Ressort)
  const popVariants: Variants = {
    offscreen: { 
      opacity: 0, 
      scale: 0.8, 
      y: 50 
    },
    onscreen: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring",
        bounce: 0.4,
        duration: 0.8
      } 
    }
  };

  return (
    <div className={`w-full max-w-5xl mx-auto px-6 `}>
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="visible" 
        className="space-y-32"
      >
        
        {/* TITRE INTRO : Animation de glissement */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <h1 className="text-7xl md:text-[130px] font-black leading-[0.8] uppercase tracking-tighter text-white select-none">
            NOUS <br /> 
            <span className="text-[#EAB308] italic">SOMMES</span> <br /> 
            DEMAIN<span className="text-[#EAB308]">.</span>
          </h1>
        </motion.div>

        {/* LISTAGE DYNAMIQUE AU SCROLL */}
        <div className="space-y-48"> {/* Plus d'espace pour mieux voir l'effet au scroll */}
          {items.map((item, i) => (
            <motion.section 
              key={i} 
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: false, amount: 0.3 }} // L'animation se redéclenche (false) ou une seule fois (true)
              variants={popVariants}
              className={`flex flex-col ${item.align === 'right' ? 'md:items-end text-right' : 'items-start text-left'}`}
            >
              <div className="max-w-xl space-y-6">
                <motion.span 
                  whileHover={{ scale: 1.1 }}
                  className="inline-block bg-[#EAB308] text-black text-[10px] font-black px-3 py-1 uppercase tracking-[0.2em]"
                >
                  {item.tag}
                </motion.span>
                
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">
                  {item.title}
                </h2>
                
                <p className="text-zinc-400 text-xl md:text-2xl font-medium leading-tight tracking-tight">
                  {item.desc}
                </p>
                
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "80px" }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-1.5 bg-[#EAB308] rounded-full" 
                />
              </div>
            </motion.section>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AboutMedia;