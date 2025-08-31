'use client'

import React, { useEffect } from 'react'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-python'

interface BlockNoteRendererProps {
  content: string
}

export function BlockNoteRenderer({ content }: BlockNoteRendererProps) {
  useEffect(() => {
    Prism.highlightAll()
  }, [content])

  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  const processCodeBlocks = (html: string) => {
    return html.replace(
      /<pre><code class="bn-inline-content language-(.*?)">([\s\S]*?)<\/code><\/pre>/g,
      (_, lang, code) => {
        const decoded = code
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')

        return `<pre class="not-prose"><code class="language-${lang}">${escapeHtml(
          decoded
        )}</code></pre>`
      }
    )
  }

  const processVideoTags = (html: string) => {
    return html.replace(/<video.*?src="(.*?)".*?><\/video>/g, (_, src) => {
      if (src.includes('youtube.com') || src.includes('youtu.be')) {
        const id = src.includes('youtube.com')
          ? src.split('v=')[1]?.split('&')[0]
          : src.split('youtu.be/')[1]

        if (id) {
          return `<div class="aspect-video my-4"><iframe class="w-full h-full rounded-lg shadow-md" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe></div>`
        }
      }

      if (src.includes('vkvideo.ru')) {
        const vkSrc = src.replace('vkvideo.ru/video', 'vk.com/video')
        return `<div class="aspect-video my-4"><iframe class="w-full h-full rounded-lg shadow-md" src="${vkSrc}" frameborder="0" allowfullscreen></iframe></div>`
      }

      return `<video controls width="100%" src="${src}" class="rounded-lg shadow-md my-4"></video>`
    })
  }

  const processImages = (html: string) => {
    return html.replace(/<img src="(.*?)"(.*?)\/?>/g, (_, src, rest) => {
      return `<figure><img src="${src}" ${rest} class="rounded-lg shadow-md mx-auto" /><figcaption class="text-center text-sm mt-2 text-gray-500">${src
        .split('/')
        .pop()}</figcaption></figure>`
    })
  }

  const processHeadings = (html: string) => {
    return html.replace(/<h([1-4])>(.*?)<\/h\1>/g, (_, level, text) => {
      const id = text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
      return `<h${level} id="${id}" class="group scroll-mt-24">${text} <a href="#${id}" class="ml-2 opacity-0 group-hover:opacity-100 text-blue-500">#</a></h${level}>`
    })
  }

  const processBlockquotes = (html: string) => {
    return html.replace(
      /<blockquote>(.*?)<\/blockquote>/gs,
      (_, content) =>
        `<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4">${content}</blockquote>`
    )
  }

  const processLinks = (html: string) => {
    return html.replace(
      /<a href="(.*?)"(.*?)>(.*?)<\/a>/g,
      (_, href, attrs, text) => {
        return `<a href="${href}" ${attrs} class="text-blue-600 underline underline-offset-2 hover:text-blue-800 transition-colors" target="_blank" rel="noopener noreferrer">${text}</a>`
      }
    )
  }

  const processContent = (raw: string) => {
    let processed = raw
    processed = processCodeBlocks(processed)
    processed = processVideoTags(processed)
    processed = processImages(processed)
    processed = processHeadings(processed)
    processed = processBlockquotes(processed)
    processed = processLinks(processed)
    return processed
  }

  return (
    <div
      className="blocknote-rendered-content prose prose-slate dark:prose-invert max-w-none prose-img:rounded-xl prose-pre:bg-[#2d2d2d] prose-code:text-sm"
      dangerouslySetInnerHTML={{ __html: processContent(content) }}
    />
  )
}
