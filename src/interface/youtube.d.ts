export interface YouTubeApiResponse {
    kind: string
    etag: string
    items: Item[]
    pageInfo: PageInfo
}

export interface Item {
    kind: string
    etag: string
    id: string
    snippet: Snippet
    contentDetails: ContentDetails
    topicDetails: TopicDetails
    localizations?: Localizations
}

export interface Snippet {
    publishedAt: string
    channelId: string
    title: string
    description: string
    channelTitle: string
    categoryId: string
    liveBroadcastContent: string
    localized: Localized
    defaultLanguage?: string
    defaultAudioLanguage?: string
}
export interface Localized {
    title: string
    description: string
}

export interface ContentDetails {
    duration: string
    dimension: string
    definition: string
    caption: string
    licensedContent: boolean
    projection: string
}

export interface ContentRating { }

export interface TopicDetails {
    topicCategories: string[]
}

export interface Localizations {
    [key: string]: LocalizationThing
}

export interface LocalizationThing {
    title: string
    description: string
}


export interface PageInfo {
    totalResults: number
    resultsPerPage: number
}
