export type DaraaRecommendation = '6' | '8' | '10' | 'made-to-measure';
export type FitPreference = 'traditional' | 'tailored';

export interface SizingInput {
  heightCm: number;
  weightKg: number;
  fitPreference?: FitPreference;
}

export interface SizingResult {
  recommendedSize: DaraaRecommendation;
  isMadeToMeasure: boolean;
  confidence: 'high' | 'moderate';
  dimensions: {
    estimatedLengthCm: number;
    estimatedChestCm: number;
  };
  explanation: {
    ar: string;
    fr: string;
    en: string;
  };
}

/**
 * Intelligent sizing algorithm for the Mauritanian Daraa.
 * Takes user height, weight and fit preference, returning the optimal ready-made size (6, 8, 10)
 * or recommending bespoke made-to-measure tailoring for outlier measurements.
 */
export function calculateDaraaSize(input: SizingInput): SizingResult {
  const { heightCm, weightKg, fitPreference = 'traditional' } = input;

  // Estimated garment length (shoulder to hem, hanging ~3-5cm above ankles)
  const estimatedLengthCm = Math.round(heightCm * 0.78);
  // Estimated chest circumference with traditional ease
  const estimatedChestCm = Math.round(weightKg * 1.1 + 45);

  // Outlier heights require bespoke tailoring
  if (heightCm < 158 || heightCm > 200 || weightKg < 45 || weightKg > 135) {
    return {
      recommendedSize: 'made-to-measure',
      isMadeToMeasure: true,
      confidence: 'high',
      dimensions: { estimatedLengthCm, estimatedChestCm },
      explanation: {
        ar: 'قياساتك خارج المقاسات الجاهزة المعتادة. للحصول على ثوب ينسدل بوقار وأناقة مثالية، ننصح باختيار الخياطة حسب الطلب.',
        fr: 'Vos mensurations diffèrent des standards prêts-à-porter. Nous vous recommandons une confection sur mesure pour un tombé parfait.',
        en: 'Your measurements are outside standard ready-to-wear sizes. We recommend bespoke made-to-measure tailoring for an impeccable drape.',
      },
    };
  }

  // Shorter to medium stature: typically size 6
  if (heightCm < 173) {
    if (weightKg > 85 && fitPreference === 'traditional') {
      return {
        recommendedSize: '8',
        isMadeToMeasure: false,
        confidence: 'moderate',
        dimensions: { estimatedLengthCm, estimatedChestCm },
        explanation: {
          ar: 'بناءً على وزنك مع تفضيل القصة الفضفاضة، مقاس 8 يوفر راحة واتساعاً ممتازاً على الكتفين.',
          fr: 'Compte tenu de votre corpulence et d’une coupe traditionnelle, la taille 8 offrira une aisance optimale.',
          en: 'Given your build and preference for a traditional drape, size 8 provides comfortable ease across the shoulders.',
        },
      };
    }

    return {
      recommendedSize: '6',
      isMadeToMeasure: false,
      confidence: 'high',
      dimensions: { estimatedLengthCm, estimatedChestCm },
      explanation: {
        ar: 'مقاس 6 هو الأنسب لطولك، يضمن نزول الدراعة عند الكاحل دون ملامسة الأرض مع وسع متناسق.',
        fr: 'La taille 6 correspond parfaitement à votre stature, garantissant une longueur idéale au-dessus des chevilles.',
        en: 'Size 6 fits your height perfectly, ensuring the hem sits gracefully above the ankles.',
      },
    };
  }

  // Medium to tall stature: standard adult size 8
  if (heightCm <= 184) {
    if (heightCm >= 182 && weightKg >= 92) {
      return {
        recommendedSize: '10',
        isMadeToMeasure: false,
        confidence: 'high',
        dimensions: { estimatedLengthCm, estimatedChestCm },
        explanation: {
          ar: 'لطولك وبنيتك العريضة، مقas 10 يمنحك هيبة أكبر وراحة فائقة أثناء الحركة.',
          fr: 'Pour votre stature et carrure, la taille 10 offre une prestance royale et une grande liberté de mouvement.',
          en: 'For your height and broad frame, size 10 grants majestic presence and effortless mobility.',
        },
      };
    }

    if (heightCm <= 174 && weightKg <= 62 && fitPreference === 'tailored') {
      return {
        recommendedSize: '6',
        isMadeToMeasure: false,
        confidence: 'moderate',
        dimensions: { estimatedLengthCm, estimatedChestCm },
        explanation: {
          ar: 'مع بنية نحيفة وتفضيل قصة معاصرة، مقاس 6 يعطيك مظهراً رشيقاً ومضبوطاً.',
          fr: 'Avec une silhouette fine et une coupe ajustée, la taille 6 évite un excès de tissu.',
          en: 'With a slender build and tailored preference, size 6 provides a clean contemporary silhouette.',
        },
      };
    }

    return {
      recommendedSize: '8',
      isMadeToMeasure: false,
      confidence: 'high',
      dimensions: { estimatedLengthCm, estimatedChestCm },
      explanation: {
        ar: 'مقاس 8 هو المقاس الذهبي الأكثر توازناً، يمنحك التوازن المثالي بين الاتساع الوقور وطول الهيبة.',
        fr: 'La taille 8 est la taille de référence : équilibre parfait entre longueur et amplitude noble.',
        en: 'Size 8 is the ideal standard size: offering the perfect balance between regal drape and length.',
      },
    };
  }

  // Tall stature (185cm - 200cm): size 10
  return {
    recommendedSize: '10',
    isMadeToMeasure: false,
    confidence: 'high',
    dimensions: { estimatedLengthCm, estimatedChestCm },
    explanation: {
      ar: 'مقاس 10 مصمم لطوال القامة، يوفر طولاً مهيباً وتغطية كاملة مع وقار أصيل.',
      fr: 'La taille 10 est conçue pour les hommes grands, assurant longueur majestueuse et ampleur traditionnelle.',
      en: 'Size 10 is designed for taller men, providing a grand full-length silhouette with traditional volume.',
    },
  };
}

