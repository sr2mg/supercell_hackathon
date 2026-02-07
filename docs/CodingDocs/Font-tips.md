# Font Loading Tips

## Using CSS Variables Directly
If Tailwind font classes (e.g., `font-lilita`) are not applying correctly, use the CSS variable directly in the `style` prop. Next.js `next/font` injects these variables into the CSS OM, ensuring they are available.

### Example

**Problem:**
```tsx
// Sometimes fails to load the font correctly
<div className="font-lilita"> 
  Text 
</div>
```

**Solution:**
```tsx
// Forces the font family using the injected CSS variable
<div style={{ fontFamily: 'var(--font-lilita-one)' }}>
  Text
</div>
```

This bypasses potential class generation or specificity issues with Tailwind and ensures the font is rendered as long as the variable is available in the root layout.
