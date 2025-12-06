# Internationalization (i18n) Implementation Plan

This document outlines the plan to add multi-language support (English, Spanish, Arabic, Russian) to the application.

## Overview

The application currently uses Turkish (tr) as the default language. We need to add support for:
- English (en)
- Spanish (es)
- Arabic (ar)
- Russian (ru)

## Recommended Library

**next-intl** - The most popular and recommended i18n solution for Next.js 14 App Router

### Installation

```bash
npm install next-intl
```

## Implementation Steps

### Phase 1: Setup and Configuration

1. **Install next-intl**
   ```bash
   npm install next-intl
   ```

2. **Create i18n configuration file**
   - Create `src/i18n/config.ts` with locale configuration
   - Create `src/i18n/request.ts` for server-side locale detection

3. **Update Next.js configuration**
   - Modify `next.config.js` to support i18n routing
   - Update middleware for locale detection

4. **Create locale directory structure**
   ```
   messages/
     en.json
     es.json
     ar.json
     ru.json
     tr.json (default)
   ```

### Phase 2: Translation Files

Create comprehensive translation files for all 5 languages:

1. **Common translations** (buttons, labels, messages)
2. **Page-specific translations** (dashboard, orders, customers, products, etc.)
3. **Form labels and validation messages**
4. **Error messages**
5. **Success messages**

### Phase 3: Code Updates

1. **Update layout and providers**
   - Wrap app with `NextIntlClientProvider`
   - Update root layout for locale routing

2. **Create locale switcher component**
   - Add language selector in header/settings
   - Store preference in localStorage + cookie

3. **Update all UI components**
   - Replace hardcoded Turkish text with `useTranslations()` hooks
   - Update date/time formatting to use locale
   - Update number/currency formatting

4. **Update API responses**
   - Ensure error messages support i18n
   - Update email templates (if applicable)

### Phase 4: RTL Support (Arabic)

1. **Add RTL support**
   - Update CSS for RTL layout
   - Use `dir="rtl"` for Arabic locale
   - Test all components in RTL mode

## File Structure

```
src/
  i18n/
    config.ts
    request.ts
  app/
    [locale]/  (new - wrap all routes)
      (dashboard)/
        ...
messages/
  en.json
  es.json
  ar.json
  ru.json
  tr.json
```

## Key Components to Update

### High Priority
- Settings page (language switcher location)
- All dashboard pages
- Forms (validation messages)
- Toast notifications
- Error pages

### Medium Priority
- Receipts/invoices
- Reports
- Email templates
- PDF exports

## Estimated Complexity

- **Setup**: 2-3 hours
- **Translation files**: 8-10 hours (creating all translations)
- **Component updates**: 15-20 hours (updating all components)
- **RTL support**: 3-4 hours
- **Testing**: 4-6 hours

**Total**: ~35-45 hours of work

## Quick Start Implementation

Would you like me to:
1. Set up the basic i18n infrastructure now?
2. Create translation files for one page as an example?
3. Implement the language switcher?
4. Or would you prefer to do this in phases?

Let me know your preference and I'll start implementing!

