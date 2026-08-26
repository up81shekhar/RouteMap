import { RoadmapNodeData, NodeState, getStaticTopicContent } from "../data/sampleRoadmaps";
import { useProgressStore } from "../store/progressStore";

/**
 * A node is "done" once every lesson in its static content list is
 * completed; "current" once reached but not yet done; "locked" until every
 * node before it (in order) is done. The first node is always reachable.
 *
 * This has to be computed on read, not stored — progress changes constantly
 * as the learner completes lessons, and node objects coming from the API/
 * admin store have no idea about per-user progress at all.
 */
export function computeNodeStates(roadmapSlug: string, nodes: RoadmapNodeData[]): RoadmapNodeData[] {
  const { completed } = useProgressStore.getState();
  let reached = true;

  return nodes.map((node) => {
    const key = `${roadmapSlug}/${node.slug}`;
    const totalLessons = getStaticTopicContent(roadmapSlug, node.slug, node.title).lessons.length;
    const completedCount = completed[key]?.length ?? 0;
    const isDone = totalLessons > 0 && completedCount >= totalLessons;

    let state: NodeState;
    if (!reached) state = "locked";
    else state = isDone ? "done" : "current";

    reached = reached && isDone;
    return { ...node, state };
  });
}
