import { Link } from "wouter";
import { ErrorState, LoadingState } from "@/components/craft/EmptyState";
import TitleHeader from "@/components/craft/TitleHeader";
import { buttonVariants } from "@/components/ui/button";
import ParentTagsSection from "./components/ParentTagsSection";
import TagCoverModal from "./components/TagCoverModal";
import TagsSection from "./components/TagsSection";
import {
  RemoteTagContextProvider,
  useRemoteTagContext,
} from "./Remote.Tags.Context";

function RemoteTagBody() {
  const { loadState } = useRemoteTagContext();
  if (loadState.isError)
    return (
      <ErrorState
        title="Couldn't load remote tags"
        message={loadState.message}
        onRetry={loadState.retry}
      >
        <Link
          href="/settings"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Check server address
        </Link>
      </ErrorState>
    );
  if (loadState.isPending)
    return (
      <LoadingState
        label="Loading remote tags…"
        hint="Taking long? Check the server address in Settings."
      />
    );
  return (
    <div className="grid grid-cols-1 gap-5 pb-10">
      <ParentTagsSection />
      <TagCoverModal />
      <TagsSection />
    </div>
  );
}

export default function TagPage() {
  return (
    <>
      <TitleHeader
        Title="Remote Tags"
        description="Tags on your TagApp server, grouped by the part before the colon. The number beside a tag is how many items use it."
      />
      <RemoteTagContextProvider>
        <RemoteTagBody />
      </RemoteTagContextProvider>
    </>
  );
}
