import { useEffect } from 'react'

export interface SeoProps {
  title?: string
  description?: string
  image?: string
  type?: 'website' | 'product' | 'article'
}

const DEFAULT_TITLE = 'Classy Men Rim — فاخر ملابس رجالية في موريتانيا'
const DEFAULT_DESC =
  'Classy Men Rim — متجر الأزياء الرجالية الفاخر في موريتانيا. تصاميم راقية، دراعة، بدل، عطور وإكسسوارات.'

function setMetaTag(attrName: 'name' | 'property', key: string, content: string | undefined) {
  if (!content) return
  let element = document.querySelector(`meta[${attrName}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attrName, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

/**
 * Lightweight, zero-dependency SEO updater.
 * Updates document.title and Open Graph / Twitter meta tags dynamically.
 */
export function SeoHead({ title, description, image, type = 'website' }: SeoProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Classy Men Rim` : DEFAULT_TITLE
    const finalDesc = description || DEFAULT_DESC

    document.title = fullTitle

    setMetaTag('name', 'description', finalDesc)
    setMetaTag('property', 'og:title', fullTitle)
    setMetaTag('property', 'og:description', finalDesc)
    setMetaTag('property', 'og:type', type)
    setMetaTag('name', 'twitter:title', fullTitle)
    setMetaTag('name', 'twitter:description', finalDesc)
    setMetaTag('name', 'twitter:card', 'summary_large_image')

    if (image) {
      setMetaTag('property', 'og:image', image)
      setMetaTag('name', 'twitter:image', image)
    }
  }, [title, description, image, type])

  return null
}

