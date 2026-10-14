interface PointImageProps {
  path: string
  alt: string
}

const resolve = (path: string): string => (/^(https?:)?\/\//.test(path) ? path : `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`)

export function PointImage({ path, alt }: PointImageProps) {
  return <img className="point-image" src={resolve(path)} alt={alt} loading="lazy" />
}
