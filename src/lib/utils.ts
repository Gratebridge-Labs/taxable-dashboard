import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// `text-1`..`text-15` are custom font-size utilities (globals.css) but
// tailwind-merge v3 defaults only accept t-shirt sizes (xs/sm/md/lg/xl) for
// the `text-*` font-size namespace, so bare numeric `text-2` is classified
// as a text-COLOR utility and gets stripped when merged with `text-neutral-*`
// (e.g. the shadcn `Label` component). Register these keys as font-size
// values so the merge keeps them.
const customTwMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs))
}
