import { defineField, defineType } from 'sanity'

// Session 2.4 — the real image pipeline. One of these travels with every
// image record instead of a bare Sanity `image` field. The four fields below
// are all required: an image with no photographer, no licence, no source,
// and no alt text is exactly the "unlicensed or undescribed image" the
// Master Build Plan says must be physically impossible to publish here.
//
// This gate protects the same thing Session 2.4's quarantine of 175
// AI-generated images and the self-hosting of 41 legacy stock photos both
// protect: a real photo of a real, named place needs a real, checkable
// answer to "whose photo is this, and on what terms can we use it."

export const sourcedImage = defineType({
  name: 'sourcedImage',
  title: 'Sourced Image',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: r => r.required(),
    }),
    defineField({
      name: 'photographerName',
      title: 'Photographer / Credit',
      type: 'string',
      description:
        'Who took this photo, or which organisation supplied it (e.g. a tourism board). Never a placeholder — if this is unknown, the image is not ready to publish.',
      validation: r => r.required().min(2),
    }),
    defineField({
      name: 'photographerUrl',
      title: 'Photographer / Source Profile URL',
      type: 'url',
      description: 'Optional: a link to the photographer or organisation, for on-page credit.',
    }),
    defineField({
      name: 'licence',
      title: 'Licence',
      type: 'string',
      options: {
        list: [
          { title: 'Tourism Board Partnership', value: 'Tourism Board Partnership' },
          { title: 'Commissioned (MyAfroWaka owns or holds a licence)', value: 'Commissioned' },
          { title: 'Licensed Stock (paid)', value: 'Licensed Stock (paid)' },
          { title: 'Creative Commons — attribution required', value: 'Creative Commons (attribution required)' },
          { title: 'Public Domain / CC0', value: 'Public Domain / CC0' },
        ],
      },
      validation: r => r.required(),
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Source URL',
      type: 'url',
      description: 'Where this image came from — the tourism board page, the licence receipt, the photographer’s original post. The paper trail for the licence field above.',
      validation: r => r.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
      description: 'Describes what is actually in the photo. Not the place name alone — describe the scene.',
      validation: r => r.required().min(10),
    }),
  ],
  preview: {
    select: { media: 'image', title: 'photographerName', subtitle: 'licence' },
  },
})
