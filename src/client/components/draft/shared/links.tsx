import { EditorState, RichUtils } from "draft-js"

/**
 * Helpers for draft-js link handling
 */

/**
 * Creates a link entity from url, accomodates follow buttons
 */
export const confirmLink = (
  url: string,
  editorState: EditorState,
  isFollowLink: boolean = false
) => {
  let className
  if (isFollowLink) {
    className = "is-follow-link"
  }
  const contentState = editorState.getCurrentContent()
  const currentContent = contentState.createEntity("LINK", "MUTABLE", {
    url,
    className,
  })
  const stateWithEntity = EditorState.set(editorState, { currentContent })
  const entityKey = currentContent.getLastCreatedEntityKey()
  // Insert entity at text selection
  return RichUtils.toggleLink(
    stateWithEntity,
    stateWithEntity.getSelection(),
    entityKey
  )
}

/**
 * Remove link entities from selected text
 */
export const removeLink = (editorState: EditorState) => {
  const selection = editorState.getSelection()
  const hasTextSelection = !selection.isCollapsed()

  if (hasTextSelection) {
    return RichUtils.toggleLink(editorState, selection, null)
  } else {
    return false
  }
}

/**
 * Returns data from an existing link in a text selection
 */
export const linkDataFromSelection = (editorState: EditorState) => {
  const contentState = editorState.getCurrentContent()
  const selection = editorState.getSelection()
  const startKey = selection.getStartKey()
  const startOffset = selection.getStartOffset()
  const blockWithLink = contentState.getBlockForKey(startKey)
  const linkKey = blockWithLink.getEntityAt(startOffset)

  if (linkKey) {
    // If selected text has a link, return data
    const entity = contentState.getEntity(linkKey)
    return entity.getData()
  } else {
    return ""
  }
}
