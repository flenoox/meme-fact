import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  outDir: '.output',
  manifest: ({ browser }) => ({
    name: 'Meme Fact',
    short_name: 'Meme Fact',
    description: 'Absurd facts. One click.',
    version: '0.0.1',
    permissions: ['storage'],
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      96: 'icon/96.png',
      128: 'icon/128.png',
    },
    action: {
      default_title: 'Meme Fact',
      default_icon: { 16: 'icon/16.png', 32: 'icon/32.png', 48: 'icon/48.png' },
      default_popup: 'popup.html',
    },
    ...(browser === 'firefox' ? {
      browser_specific_settings: {
        gecko: {
          id: 'meme-fact@memefact.app',
          strict_min_version: '115.0',
          data_collection_permissions: { required: ['none'] },
        },
      },
    } : {}),
  }),
});
