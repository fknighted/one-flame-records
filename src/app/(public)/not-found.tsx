import NotFoundContent from "@/components/NotFoundContent";

// notFound() inside a public page (for example a missing artist) lands here,
// already inside the public layout's header and footer.
export default function PublicNotFound() {
  return <NotFoundContent />;
}
