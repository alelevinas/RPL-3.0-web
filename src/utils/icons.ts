export const languageIcons: Record<string, string> = {
  c_std11: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
  python_3: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  "python_3.10": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  go_1: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg",
  "go_1.19": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg",
  rust: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg",
  "rust_1.88.0": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg",
  java_17: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
};

export const getLanguageIcon = (lang: string): string => {
  return languageIcons[lang] || languageIcons["c_std11"];
};
