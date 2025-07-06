import localFont from 'next/font/local'

export const gilroy = localFont({
  src: [
    {
      path: '../fonts/Gilroy-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../fonts/Gilroy-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/Gilroy-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/Gilroy-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-gilroy',
})