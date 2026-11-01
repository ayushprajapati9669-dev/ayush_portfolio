with open('client/src/pages/Home/Home.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = """        .from(
          '.hero-actions-editorial > *',
          {
            y: 15,
            opacity: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: 'back.out(1.2)'
          },
          '-=0.3'
        )
        .from(
          '.hero-bottom-footer',
          {
            y: 20,
            opacity: 0,
            duration: 0.6
          },
          '-=0.3'
        );"""

replacement = """        .fromTo(
          '.hero-actions-editorial > *',
          { y: 15, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power2.out',
            clearProps: 'all'
          },
          '-=0.3'
        )
        .fromTo(
          '.hero-bottom-footer',
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            clearProps: 'all'
          },
          '-=0.3'
        );"""

if target in text:
    text = text.replace(target, replacement)
    with open('client/src/pages/Home/Home.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Updated GSAP timeline in Home.jsx")
else:
    print("Target not found in Home.jsx")

