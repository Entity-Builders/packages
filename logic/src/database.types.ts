export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      active_zone: {
        Row: {
          city: string | null
          createdAt: string
          id: string
          last_seen_at: string
          latitude: number
          longitude: number
          request_count: number
        }
        Insert: {
          city?: string | null
          createdAt?: string
          id: string
          last_seen_at?: string
          latitude: number
          longitude: number
          request_count?: number
        }
        Update: {
          city?: string | null
          createdAt?: string
          id?: string
          last_seen_at?: string
          latitude?: number
          longitude?: number
          request_count?: number
        }
        Relationships: []
      }
      activity: {
        Row: {
          address: string | null
          businessStatus: string | null
          createdAt: string
          description: string | null
          difficulty: Database["public"]["Enums"]["Difficulty"] | null
          duration: number | null
          externalId: string | null
          formattedAddress: string | null
          geom: unknown
          id: string
          knownActivityTypeName: string | null
          latitude: number | null
          location: Json | null
          longitude: number | null
          maxGroupSize: number | null
          metadata: Json | null
          name: string
          openingHours: Json | null
          phoneNumber: string | null
          photos: Json | null
          placeId: string | null
          price: number | null
          priceLevel: number | null
          rating: number | null
          ratingCount: number | null
          sourceId: string | null
          type: string | null
          updatedAt: string
          website: string | null
        }
        Insert: {
          address?: string | null
          businessStatus?: string | null
          createdAt?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["Difficulty"] | null
          duration?: number | null
          externalId?: string | null
          formattedAddress?: string | null
          geom?: unknown
          id: string
          knownActivityTypeName?: string | null
          latitude?: number | null
          location?: Json | null
          longitude?: number | null
          maxGroupSize?: number | null
          metadata?: Json | null
          name: string
          openingHours?: Json | null
          phoneNumber?: string | null
          photos?: Json | null
          placeId?: string | null
          price?: number | null
          priceLevel?: number | null
          rating?: number | null
          ratingCount?: number | null
          sourceId?: string | null
          type?: string | null
          updatedAt: string
          website?: string | null
        }
        Update: {
          address?: string | null
          businessStatus?: string | null
          createdAt?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["Difficulty"] | null
          duration?: number | null
          externalId?: string | null
          formattedAddress?: string | null
          geom?: unknown
          id?: string
          knownActivityTypeName?: string | null
          latitude?: number | null
          location?: Json | null
          longitude?: number | null
          maxGroupSize?: number | null
          metadata?: Json | null
          name?: string
          openingHours?: Json | null
          phoneNumber?: string | null
          photos?: Json | null
          placeId?: string | null
          price?: number | null
          priceLevel?: number | null
          rating?: number | null
          ratingCount?: number | null
          sourceId?: string | null
          type?: string | null
          updatedAt?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_knownActivityTypeName_fkey"
            columns: ["knownActivityTypeName"]
            isOneToOne: false
            referencedRelation: "known_activity_types"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "activity_placeId_fkey"
            columns: ["placeId"]
            isOneToOne: false
            referencedRelation: "place"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_sourceId_fkey"
            columns: ["sourceId"]
            isOneToOne: false
            referencedRelation: "source"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_places: {
        Row: {
          activity_id: string
          place_id: string
          position: number
          role: string
        }
        Insert: {
          activity_id: string
          place_id: string
          position?: number
          role?: string
        }
        Update: {
          activity_id?: string
          place_id?: string
          position?: number
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_places_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "place"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_relationship: {
        Row: {
          compatibilityScore: number
          createdAt: string
          distanceScore: number
          id: string
          metadata: Json | null
          reasoning: string | null
          relationType: Database["public"]["Enums"]["RelationType"]
          sourceActivityId: string
          targetActivityId: string
          timeCompatibilityScore: number
          timeGapRecommended: number | null
          updatedAt: string
          varietyScore: number
        }
        Insert: {
          compatibilityScore: number
          createdAt?: string
          distanceScore: number
          id: string
          metadata?: Json | null
          reasoning?: string | null
          relationType: Database["public"]["Enums"]["RelationType"]
          sourceActivityId: string
          targetActivityId: string
          timeCompatibilityScore: number
          timeGapRecommended?: number | null
          updatedAt: string
          varietyScore: number
        }
        Update: {
          compatibilityScore?: number
          createdAt?: string
          distanceScore?: number
          id?: string
          metadata?: Json | null
          reasoning?: string | null
          relationType?: Database["public"]["Enums"]["RelationType"]
          sourceActivityId?: string
          targetActivityId?: string
          timeCompatibilityScore?: number
          timeGapRecommended?: number | null
          updatedAt?: string
          varietyScore?: number
        }
        Relationships: [
          {
            foreignKeyName: "activity_relationship_sourceActivityId_fkey"
            columns: ["sourceActivityId"]
            isOneToOne: false
            referencedRelation: "activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_relationship_targetActivityId_fkey"
            columns: ["targetActivityId"]
            isOneToOne: false
            referencedRelation: "activity"
            referencedColumns: ["id"]
          },
        ]
      }
      briefing_links: {
        Row: {
          client_summary: string | null
          context_notes: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          mode: string
          owner_id: string
          profession_context: string | null
          seed_questions: Json | null
          slug: string
          status: string
          title: string
        }
        Insert: {
          client_summary?: string | null
          context_notes?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          mode?: string
          owner_id: string
          profession_context?: string | null
          seed_questions?: Json | null
          slug: string
          status?: string
          title: string
        }
        Update: {
          client_summary?: string | null
          context_notes?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          mode?: string
          owner_id?: string
          profession_context?: string | null
          seed_questions?: Json | null
          slug?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefing_links_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "tellee_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      briefing_replies: {
        Row: {
          answer_text: string
          briefing_id: string
          created_at: string | null
          id: string
          question_index: number
          question_text: string
        }
        Insert: {
          answer_text: string
          briefing_id: string
          created_at?: string | null
          id?: string
          question_index: number
          question_text: string
        }
        Update: {
          answer_text?: string
          briefing_id?: string
          created_at?: string | null
          id?: string
          question_index?: number
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefing_replies_briefing_id_fkey"
            columns: ["briefing_id"]
            isOneToOne: false
            referencedRelation: "briefings"
            referencedColumns: ["id"]
          },
        ]
      }
      briefings: {
        Row: {
          client_input: string
          created_at: string | null
          curated_json: Json
          id: string
          link_id: string
        }
        Insert: {
          client_input: string
          created_at?: string | null
          curated_json: Json
          id?: string
          link_id: string
        }
        Update: {
          client_input?: string
          created_at?: string | null
          curated_json?: Json
          id?: string
          link_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefings_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "briefing_links"
            referencedColumns: ["id"]
          },
        ]
      }
      care_logs: {
        Row: {
          care_type: string
          created_at: string | null
          id: string
          notes: string | null
          performed_at: string | null
          photo_url: string | null
          pot_id: string
        }
        Insert: {
          care_type: string
          created_at?: string | null
          id?: string
          notes?: string | null
          performed_at?: string | null
          photo_url?: string | null
          pot_id: string
        }
        Update: {
          care_type?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          performed_at?: string | null
          photo_url?: string | null
          pot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_logs_pot_id_fkey"
            columns: ["pot_id"]
            isOneToOne: false
            referencedRelation: "pots"
            referencedColumns: ["id"]
          },
        ]
      }
      care_schedules: {
        Row: {
          care_type: string
          created_at: string | null
          frequency_days: number | null
          id: string
          last_care_date: string | null
          next_care_date: string | null
          notes: string | null
          pot_id: string
          updated_at: string | null
        }
        Insert: {
          care_type: string
          created_at?: string | null
          frequency_days?: number | null
          id?: string
          last_care_date?: string | null
          next_care_date?: string | null
          notes?: string | null
          pot_id: string
          updated_at?: string | null
        }
        Update: {
          care_type?: string
          created_at?: string | null
          frequency_days?: number | null
          id?: string
          last_care_date?: string | null
          next_care_date?: string | null
          notes?: string | null
          pot_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_schedules_pot_id_fkey"
            columns: ["pot_id"]
            isOneToOne: false
            referencedRelation: "pots"
            referencedColumns: ["id"]
          },
        ]
      }
      client_question_replies: {
        Row: {
          answer_text: string
          briefing_id: string
          created_at: string | null
          id: string
          question_index: number
          question_text: string
        }
        Insert: {
          answer_text: string
          briefing_id: string
          created_at?: string | null
          id?: string
          question_index: number
          question_text: string
        }
        Update: {
          answer_text?: string
          briefing_id?: string
          created_at?: string | null
          id?: string
          question_index?: number
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_question_replies_briefing_id_fkey"
            columns: ["briefing_id"]
            isOneToOne: false
            referencedRelation: "briefings"
            referencedColumns: ["id"]
          },
        ]
      }
      crawler_search: {
        Row: {
          createdAt: string
          deviceToken: string | null
          id: string
          latitude: number
          longitude: number
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          deviceToken?: string | null
          id: string
          latitude: number
          longitude: number
          updatedAt: string
        }
        Update: {
          createdAt?: string
          deviceToken?: string | null
          id?: string
          latitude?: number
          longitude?: number
          updatedAt?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          currency: string
          date: string | null
          id: number
          name: string
          original_amount: number | null
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          currency: string
          date?: string | null
          id?: number
          name: string
          original_amount?: number | null
          user_id?: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          currency?: string
          date?: string | null
          id?: number
          name?: string
          original_amount?: number | null
          user_id?: string
        }
        Relationships: []
      }
      fixed_expenses: {
        Row: {
          amount: number
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          name: string
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      known_activity_types: {
        Row: {
          category: string | null
          createdAt: string
          description: string | null
          icon: string | null
          id: string
          name: string
          updatedAt: string
        }
        Insert: {
          category?: string | null
          createdAt?: string
          description?: string | null
          icon?: string | null
          id: string
          name: string
          updatedAt: string
        }
        Update: {
          category?: string | null
          createdAt?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updatedAt?: string
        }
        Relationships: []
      }
      monthly_summaries: {
        Row: {
          created_at: string
          id: number
          month: string
          monthly_income: number | null
          savings_amount: number | null
          savings_percentage: number | null
          total_expenses: number | null
          total_income: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          month: string
          monthly_income?: number | null
          savings_amount?: number | null
          savings_percentage?: number | null
          total_expenses?: number | null
          total_income?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          month?: string
          monthly_income?: number | null
          savings_amount?: number | null
          savings_percentage?: number | null
          total_expenses?: number | null
          total_income?: number | null
          user_id?: string
        }
        Relationships: []
      }
      place: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          createdAt: string
          description: string | null
          geom: unknown
          id: string
          latitude: number
          longitude: number
          metadata: Json | null
          name: string
          photos: Json | null
          type: string
          updatedAt: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          createdAt?: string
          description?: string | null
          geom?: unknown
          id?: string
          latitude: number
          longitude: number
          metadata?: Json | null
          name: string
          photos?: Json | null
          type?: string
          updatedAt?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          createdAt?: string
          description?: string | null
          geom?: unknown
          id?: string
          latitude?: number
          longitude?: number
          metadata?: Json | null
          name?: string
          photos?: Json | null
          type?: string
          updatedAt?: string
        }
        Relationships: []
      }
      plant_species_care_guides: {
        Row: {
          air_purifying: boolean | null
          attracts_wildlife: string | null
          best_propagation_season: string | null
          care_level: string | null
          child_safe: boolean | null
          climate: string | null
          cold_hardy: boolean | null
          common_issues: string | null
          common_name: string | null
          common_pests: string[] | null
          companions: string | null
          created_at: string | null
          disease_susceptibility: string | null
          drought_tolerant: boolean | null
          edible_parts: string | null
          fertilizer_frequency: string | null
          fertilizer_season: string | null
          fertilizer_type: string | null
          flowering_season: string | null
          fragrant: boolean | null
          fruiting_season: string | null
          growth_rate: string | null
          humidity_level: string | null
          id: string
          lifespan: string | null
          light_hours: string | null
          light_requirements: string | null
          mature_height: string | null
          mature_width: string | null
          misting_frequency: string | null
          misting_required: boolean | null
          notes: string | null
          pest_prevention: string | null
          pet_safe: boolean | null
          propagation_difficulty: string | null
          propagation_method: string | null
          pruning_info: string | null
          repotting_frequency: string | null
          seasonal_care: string | null
          soil_type: string | null
          species_name: string
          temperature_range: string | null
          time_to_harvest: string | null
          updated_at: string | null
          variety: string | null
          watering_amount: string | null
          watering_frequency: string | null
        }
        Insert: {
          air_purifying?: boolean | null
          attracts_wildlife?: string | null
          best_propagation_season?: string | null
          care_level?: string | null
          child_safe?: boolean | null
          climate?: string | null
          cold_hardy?: boolean | null
          common_issues?: string | null
          common_name?: string | null
          common_pests?: string[] | null
          companions?: string | null
          created_at?: string | null
          disease_susceptibility?: string | null
          drought_tolerant?: boolean | null
          edible_parts?: string | null
          fertilizer_frequency?: string | null
          fertilizer_season?: string | null
          fertilizer_type?: string | null
          flowering_season?: string | null
          fragrant?: boolean | null
          fruiting_season?: string | null
          growth_rate?: string | null
          humidity_level?: string | null
          id?: string
          lifespan?: string | null
          light_hours?: string | null
          light_requirements?: string | null
          mature_height?: string | null
          mature_width?: string | null
          misting_frequency?: string | null
          misting_required?: boolean | null
          notes?: string | null
          pest_prevention?: string | null
          pet_safe?: boolean | null
          propagation_difficulty?: string | null
          propagation_method?: string | null
          pruning_info?: string | null
          repotting_frequency?: string | null
          seasonal_care?: string | null
          soil_type?: string | null
          species_name: string
          temperature_range?: string | null
          time_to_harvest?: string | null
          updated_at?: string | null
          variety?: string | null
          watering_amount?: string | null
          watering_frequency?: string | null
        }
        Update: {
          air_purifying?: boolean | null
          attracts_wildlife?: string | null
          best_propagation_season?: string | null
          care_level?: string | null
          child_safe?: boolean | null
          climate?: string | null
          cold_hardy?: boolean | null
          common_issues?: string | null
          common_name?: string | null
          common_pests?: string[] | null
          companions?: string | null
          created_at?: string | null
          disease_susceptibility?: string | null
          drought_tolerant?: boolean | null
          edible_parts?: string | null
          fertilizer_frequency?: string | null
          fertilizer_season?: string | null
          fertilizer_type?: string | null
          flowering_season?: string | null
          fragrant?: boolean | null
          fruiting_season?: string | null
          growth_rate?: string | null
          humidity_level?: string | null
          id?: string
          lifespan?: string | null
          light_hours?: string | null
          light_requirements?: string | null
          mature_height?: string | null
          mature_width?: string | null
          misting_frequency?: string | null
          misting_required?: boolean | null
          notes?: string | null
          pest_prevention?: string | null
          pet_safe?: boolean | null
          propagation_difficulty?: string | null
          propagation_method?: string | null
          pruning_info?: string | null
          repotting_frequency?: string | null
          seasonal_care?: string | null
          soil_type?: string | null
          species_name?: string
          temperature_range?: string | null
          time_to_harvest?: string | null
          updated_at?: string | null
          variety?: string | null
          watering_amount?: string | null
          watering_frequency?: string | null
        }
        Relationships: []
      }
      postalpeek_album_progress: {
        Row: {
          album_id: string
          completed_at: string | null
          user_id: string
        }
        Insert: {
          album_id: string
          completed_at?: string | null
          user_id: string
        }
        Update: {
          album_id?: string
          completed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "postalpeek_album_progress_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "postalpeek_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      postalpeek_album_slots: {
        Row: {
          album_id: string | null
          id: string
          lat: number | null
          lng: number | null
          postcard_id: string | null
          slot_label: string
          slot_order: number
          stop_description: string | null
          stop_status: string | null
        }
        Insert: {
          album_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          postcard_id?: string | null
          slot_label: string
          slot_order: number
          stop_description?: string | null
          stop_status?: string | null
        }
        Update: {
          album_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          postcard_id?: string | null
          slot_label?: string
          slot_order?: number
          stop_description?: string | null
          stop_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "postalpeek_album_slots_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "postalpeek_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postalpeek_album_slots_postcard_id_fkey"
            columns: ["postcard_id"]
            isOneToOne: false
            referencedRelation: "postalpeek_postcards"
            referencedColumns: ["id"]
          },
        ]
      }
      postalpeek_albums: {
        Row: {
          category: string | null
          city: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          destination_query: string | null
          difficulty: string | null
          id: string
          is_active: boolean | null
          itinerary_summary: string | null
          match_rules: Json | null
          reward_claims: number | null
          source: string | null
          status: string | null
          target_slots: number | null
          title: string
        }
        Insert: {
          category?: string | null
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          destination_query?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          itinerary_summary?: string | null
          match_rules?: Json | null
          reward_claims?: number | null
          source?: string | null
          status?: string | null
          target_slots?: number | null
          title: string
        }
        Update: {
          category?: string | null
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          destination_query?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          itinerary_summary?: string | null
          match_rules?: Json | null
          reward_claims?: number | null
          source?: string | null
          status?: string | null
          target_slots?: number | null
          title?: string
        }
        Relationships: []
      }
      postalpeek_daily_packs: {
        Row: {
          id: string
          opened_at: string
          postcard_ids: string[]
          user_id: string
        }
        Insert: {
          id?: string
          opened_at?: string
          postcard_ids?: string[]
          user_id: string
        }
        Update: {
          id?: string
          opened_at?: string
          postcard_ids?: string[]
          user_id?: string
        }
        Relationships: []
      }
      postalpeek_favorites: {
        Row: {
          created_at: string | null
          id: string
          postcard_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          postcard_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          postcard_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "postalpeek_favorites_postcard_id_fkey"
            columns: ["postcard_id"]
            isOneToOne: false
            referencedRelation: "postalpeek_postcards"
            referencedColumns: ["id"]
          },
        ]
      }
      postalpeek_feed_cache: {
        Row: {
          country: string | null
          id: string | null
          sort_index: number
        }
        Insert: {
          country?: string | null
          id?: string | null
          sort_index: number
        }
        Update: {
          country?: string | null
          id?: string | null
          sort_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "postalpeek_feed_cache_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "postalpeek_postcards"
            referencedColumns: ["id"]
          },
        ]
      }
      postalpeek_postcards: {
        Row: {
          album_id: string | null
          album_sequence: number | null
          category: string
          city: string
          claimed_at: string | null
          country: string
          created_at: string | null
          description: string
          generation_metadata: Json | null
          id: string
          illustration_url: string
          imagine_task_id: string | null
          lat: number
          lng: number
          location_name: string | null
          original_image_url: string
          owner_id: string | null
          rarity: string | null
          should_animate: boolean | null
          streetview_pov: Json | null
          video_generation_status:
            | Database["public"]["Enums"]["video_generation_status_enum"]
            | null
          video_url: string | null
          visual_tags: Json | null
        }
        Insert: {
          album_id?: string | null
          album_sequence?: number | null
          category: string
          city: string
          claimed_at?: string | null
          country: string
          created_at?: string | null
          description: string
          generation_metadata?: Json | null
          id?: string
          illustration_url: string
          imagine_task_id?: string | null
          lat: number
          lng: number
          location_name?: string | null
          original_image_url: string
          owner_id?: string | null
          rarity?: string | null
          should_animate?: boolean | null
          streetview_pov?: Json | null
          video_generation_status?:
            | Database["public"]["Enums"]["video_generation_status_enum"]
            | null
          video_url?: string | null
          visual_tags?: Json | null
        }
        Update: {
          album_id?: string | null
          album_sequence?: number | null
          category?: string
          city?: string
          claimed_at?: string | null
          country?: string
          created_at?: string | null
          description?: string
          generation_metadata?: Json | null
          id?: string
          illustration_url?: string
          imagine_task_id?: string | null
          lat?: number
          lng?: number
          location_name?: string | null
          original_image_url?: string
          owner_id?: string | null
          rarity?: string | null
          should_animate?: boolean | null
          streetview_pov?: Json | null
          video_generation_status?:
            | Database["public"]["Enums"]["video_generation_status_enum"]
            | null
          video_url?: string | null
          visual_tags?: Json | null
        }
        Relationships: []
      }
      postalpeek_shares: {
        Row: {
          created_at: string
          id: string
          is_used: boolean
          postcard_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_used?: boolean
          postcard_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_used?: boolean
          postcard_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "postalpeek_shares_postcard_id_fkey"
            columns: ["postcard_id"]
            isOneToOne: false
            referencedRelation: "postalpeek_postcards"
            referencedColumns: ["id"]
          },
        ]
      }
      postalpeek_smart_album_rules: {
        Row: {
          created_at: string | null
          creative_title: string
          filter_type: string
          filter_value: string
          id: string
        }
        Insert: {
          created_at?: string | null
          creative_title: string
          filter_type: string
          filter_value: string
          id?: string
        }
        Update: {
          created_at?: string | null
          creative_title?: string
          filter_type?: string
          filter_value?: string
          id?: string
        }
        Relationships: []
      }
      postalpeek_streetview_queries: {
        Row: {
          address: string
          created_at: string
          id: string
          image_path: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          image_path: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          image_path?: string
        }
        Relationships: []
      }
      postalpeek_validations: {
        Row: {
          ai_reasoning: string | null
          created_at: string | null
          id: string
          image_url: string | null
          postcard_id: string
          status: string
          user_id: string
        }
        Insert: {
          ai_reasoning?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          postcard_id: string
          status?: string
          user_id: string
        }
        Update: {
          ai_reasoning?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          postcard_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "postalpeek_validations_postcard_id_fkey"
            columns: ["postcard_id"]
            isOneToOne: false
            referencedRelation: "postalpeek_postcards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postalpeek_validations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      potlink_account_links: {
        Row: {
          created_at: string
          id: string
          linked_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          linked_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          linked_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      potlink_diagnosis_logs: {
        Row: {
          action_plan: Json
          ai_diagnosis: string
          chat_history: Json
          created_at: string
          general_image_url: string
          id: string
          metadata: Json | null
          pot_id: string
          soil_image_url: string | null
          urgency: string
          user_id: string
          user_query: string | null
        }
        Insert: {
          action_plan?: Json
          ai_diagnosis: string
          chat_history?: Json
          created_at?: string
          general_image_url: string
          id?: string
          metadata?: Json | null
          pot_id: string
          soil_image_url?: string | null
          urgency: string
          user_id?: string
          user_query?: string | null
        }
        Update: {
          action_plan?: Json
          ai_diagnosis?: string
          chat_history?: Json
          created_at?: string
          general_image_url?: string
          id?: string
          metadata?: Json | null
          pot_id?: string
          soil_image_url?: string | null
          urgency?: string
          user_id?: string
          user_query?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "potlink_diagnosis_logs_pot_id_fkey"
            columns: ["pot_id"]
            isOneToOne: false
            referencedRelation: "pots"
            referencedColumns: ["id"]
          },
        ]
      }
      potlink_share_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pots: {
        Row: {
          address: string | null
          created_at: string | null
          humidity: number | null
          id: string
          initial_state: string
          latitude: number | null
          location_type: string | null
          longitude: number | null
          moisture_threshold: number | null
          name: string
          notes: string | null
          photo_url: string | null
          registered_at: string | null
          registered_day_of_year: number
          seed_type: string | null
          sensor_id: string | null
          species: string
          temperature: number | null
          updated_at: string | null
          user_id: string
          variety: string | null
          weather_condition: string | null
          weather_description: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          humidity?: number | null
          id?: string
          initial_state: string
          latitude?: number | null
          location_type?: string | null
          longitude?: number | null
          moisture_threshold?: number | null
          name: string
          notes?: string | null
          photo_url?: string | null
          registered_at?: string | null
          registered_day_of_year: number
          seed_type?: string | null
          sensor_id?: string | null
          species: string
          temperature?: number | null
          updated_at?: string | null
          user_id: string
          variety?: string | null
          weather_condition?: string | null
          weather_description?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          humidity?: number | null
          id?: string
          initial_state?: string
          latitude?: number | null
          location_type?: string | null
          longitude?: number | null
          moisture_threshold?: number | null
          name?: string
          notes?: string | null
          photo_url?: string | null
          registered_at?: string | null
          registered_day_of_year?: number
          seed_type?: string | null
          sensor_id?: string | null
          species?: string
          temperature?: number | null
          updated_at?: string | null
          user_id?: string
          variety?: string | null
          weather_condition?: string | null
          weather_description?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          currency: string | null
          fixed_expenses: number | null
          id: string
          monthly_income: number | null
          savings_percentage: number | null
          stamps_balance: number | null
          updated_at: string
        }
        Insert: {
          currency?: string | null
          fixed_expenses?: number | null
          id: string
          monthly_income?: number | null
          savings_percentage?: number | null
          stamps_balance?: number | null
          updated_at?: string
        }
        Update: {
          currency?: string | null
          fixed_expenses?: number | null
          id?: string
          monthly_income?: number | null
          savings_percentage?: number | null
          stamps_balance?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      short_urls: {
        Row: {
          clicks: number | null
          created_at: string | null
          id: string
          original_url: string
          short_code: string
          updated_at: string | null
        }
        Insert: {
          clicks?: number | null
          created_at?: string | null
          id?: string
          original_url: string
          short_code: string
          updated_at?: string | null
        }
        Update: {
          clicks?: number | null
          created_at?: string | null
          id?: string
          original_url?: string
          short_code?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      source: {
        Row: {
          baseUrl: string | null
          createdAt: string
          id: string
          name: string
          type: string
          updatedAt: string
        }
        Insert: {
          baseUrl?: string | null
          createdAt?: string
          id: string
          name: string
          type?: string
          updatedAt: string
        }
        Update: {
          baseUrl?: string | null
          createdAt?: string
          id?: string
          name?: string
          type?: string
          updatedAt?: string
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      tablia_chat_sessions: {
        Row: {
          created_at: string
          customer_email: string | null
          id: string
          menu_id: string
          messages: Json
          updated_at: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          id?: string
          menu_id: string
          messages?: Json
          updated_at?: string
          venue_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          id?: string
          menu_id?: string
          messages?: Json
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tablia_chat_sessions_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "tablia_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tablia_chat_sessions_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "tablia_venues"
            referencedColumns: ["id"]
          },
        ]
      }
      tablia_menu_categories: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          is_visible: boolean
          menu_id: string
          name: string
          sort_order: number
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          is_visible?: boolean
          menu_id: string
          name: string
          sort_order?: number
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          is_visible?: boolean
          menu_id?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "tablia_menu_categories_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "tablia_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      tablia_menu_items: {
        Row: {
          category_id: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          menu_id: string
          name: string
          price: number
          sort_order: number
          tags: string[] | null
        }
        Insert: {
          category_id: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          menu_id: string
          name: string
          price?: number
          sort_order?: number
          tags?: string[] | null
        }
        Update: {
          category_id?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          menu_id?: string
          name?: string
          price?: number
          sort_order?: number
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "tablia_menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tablia_menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tablia_menu_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "tablia_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      tablia_menus: {
        Row: {
          created_at: string | null
          id: string
          name: string
          parsed_json: Json | null
          source_content: string | null
          source_type: string
          status: string
          updated_at: string | null
          venue_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string
          parsed_json?: Json | null
          source_content?: string | null
          source_type?: string
          status?: string
          updated_at?: string | null
          venue_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          parsed_json?: Json | null
          source_content?: string | null
          source_type?: string
          status?: string
          updated_at?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tablia_menus_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "tablia_venues"
            referencedColumns: ["id"]
          },
        ]
      }
      tablia_profiles: {
        Row: {
          business_name: string | null
          created_at: string | null
          display_name: string | null
          id: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
        }
        Update: {
          business_name?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      tablia_venues: {
        Row: {
          address: string | null
          created_at: string | null
          cuisine_type: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          cuisine_type?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          cuisine_type?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tablia_venues_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "tablia_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tellee_profiles: {
        Row: {
          business_description: string | null
          business_name: string | null
          created_at: string | null
          default_notes: string | null
          display_name: string | null
          id: string
          profession: string | null
        }
        Insert: {
          business_description?: string | null
          business_name?: string | null
          created_at?: string | null
          default_notes?: string | null
          display_name?: string | null
          id: string
          profession?: string | null
        }
        Update: {
          business_description?: string | null
          business_name?: string | null
          created_at?: string | null
          default_notes?: string | null
          display_name?: string | null
          id?: string
          profession?: string | null
        }
        Relationships: []
      }
      tour: {
        Row: {
          categories: string[] | null
          coverImage: string | null
          createdAt: string
          description: string | null
          duration: number | null
          estimatedBudget: number | null
          id: string
          maxGroupSize: number | null
          metadata: Json | null
          name: string
          price: number | null
          prompt: string | null
          query: string | null
          recommendedGroupSize: number | null
          startDates: string[] | null
          totalDays: number | null
          totalDistance: number | null
          updatedAt: string
          userId: string | null
        }
        Insert: {
          categories?: string[] | null
          coverImage?: string | null
          createdAt?: string
          description?: string | null
          duration?: number | null
          estimatedBudget?: number | null
          id: string
          maxGroupSize?: number | null
          metadata?: Json | null
          name: string
          price?: number | null
          prompt?: string | null
          query?: string | null
          recommendedGroupSize?: number | null
          startDates?: string[] | null
          totalDays?: number | null
          totalDistance?: number | null
          updatedAt: string
          userId?: string | null
        }
        Update: {
          categories?: string[] | null
          coverImage?: string | null
          createdAt?: string
          description?: string | null
          duration?: number | null
          estimatedBudget?: number | null
          id?: string
          maxGroupSize?: number | null
          metadata?: Json | null
          name?: string
          price?: number | null
          prompt?: string | null
          query?: string | null
          recommendedGroupSize?: number | null
          startDates?: string[] | null
          totalDays?: number | null
          totalDistance?: number | null
          updatedAt?: string
          userId?: string | null
        }
        Relationships: []
      }
      tour_activity: {
        Row: {
          actions: string[] | null
          activityData: Json | null
          activityId: string | null
          activityLatitude: number | null
          activityLongitude: number | null
          activityName: string | null
          activityType: string | null
          createdAt: string
          dayNumber: number | null
          distanceToNext: number | null
          duration: number | null
          id: string
          notes: string | null
          order: number
          startTime: string | null
          tourId: string
          transportMode: string | null
          travelTimeToNext: number | null
          updatedAt: string
        }
        Insert: {
          actions?: string[] | null
          activityData?: Json | null
          activityId?: string | null
          activityLatitude?: number | null
          activityLongitude?: number | null
          activityName?: string | null
          activityType?: string | null
          createdAt?: string
          dayNumber?: number | null
          distanceToNext?: number | null
          duration?: number | null
          id: string
          notes?: string | null
          order?: number
          startTime?: string | null
          tourId: string
          transportMode?: string | null
          travelTimeToNext?: number | null
          updatedAt: string
        }
        Update: {
          actions?: string[] | null
          activityData?: Json | null
          activityId?: string | null
          activityLatitude?: number | null
          activityLongitude?: number | null
          activityName?: string | null
          activityType?: string | null
          createdAt?: string
          dayNumber?: number | null
          distanceToNext?: number | null
          duration?: number | null
          id?: string
          notes?: string | null
          order?: number
          startTime?: string | null
          tourId?: string
          transportMode?: string | null
          travelTimeToNext?: number | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_activity_activityId_fkey"
            columns: ["activityId"]
            isOneToOne: false
            referencedRelation: "activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_activity_tourId_fkey"
            columns: ["tourId"]
            isOneToOne: false
            referencedRelation: "tour"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_cache: {
        Row: {
          data: Json
          fetched_at: string
          id: string
          latitude: number
          longitude: number
        }
        Insert: {
          data: Json
          fetched_at?: string
          id: string
          latitude: number
          longitude: number
        }
        Update: {
          data?: Json
          fetched_at?: string
          id?: string
          latitude?: number
          longitude?: number
        }
        Relationships: []
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      find_nearby_activities: {
        Args: { lat: number; lng: number; radius_meters?: number }
        Returns: {
          address: string
          description: string
          distance_meters: number
          id: string
          latitude: number
          longitude: number
          name: string
          photos: Json
          price: number
          rating: number
          type: string
        }[]
      }
      find_nearby_places: {
        Args: { lat: number; lng: number; radius_meters?: number }
        Returns: {
          address: string
          city: string
          description: string
          distance_meters: number
          id: string
          latitude: number
          longitude: number
          metadata: Json
          name: string
          photos: Json
          type: string
        }[]
      }
      generate_potlink_share_code: { Args: never; Returns: string }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_potlink_linked_accounts_info: {
        Args: never
        Returns: {
          created_at: string
          email: string
          linked_user_id: string
          name: string
        }[]
      }
      gettransactionid: { Args: never; Returns: unknown }
      increment_zone_count: { Args: { zone_id: string }; Returns: undefined }
      link_potlink_account: { Args: { share_code: string }; Returns: boolean }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postalpeek_claim_postcard: {
        Args: { p_postcard_id: string }
        Returns: Json
      }
      postalpeek_get_album_detail: {
        Args: { p_album_id: string }
        Returns: Json
      }
      postalpeek_get_album_postcard_ids: { Args: never; Returns: Json }
      postalpeek_get_albums_with_progress: { Args: never; Returns: Json }
      postalpeek_get_claim_status: { Args: never; Returns: Json }
      postalpeek_get_daily_pack: {
        Args: { p_country?: string; p_limit?: number }
        Returns: {
          album_id: string | null
          album_sequence: number | null
          category: string
          city: string
          claimed_at: string | null
          country: string
          created_at: string | null
          description: string
          generation_metadata: Json | null
          id: string
          illustration_url: string
          imagine_task_id: string | null
          lat: number
          lng: number
          location_name: string | null
          original_image_url: string
          owner_id: string | null
          rarity: string | null
          should_animate: boolean | null
          streetview_pov: Json | null
          video_generation_status:
            | Database["public"]["Enums"]["video_generation_status_enum"]
            | null
          video_url: string | null
          visual_tags: Json | null
        }[]
        SetofOptions: {
          from: "*"
          to: "postalpeek_postcards"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      postalpeek_get_distinct_countries: {
        Args: never
        Returns: {
          country: string
        }[]
      }
      postalpeek_get_random_feed: {
        Args: {
          p_albums_only?: boolean
          p_country?: string
          p_exclude_ids?: string[]
          p_limit?: number
        }
        Returns: {
          album_id: string | null
          album_sequence: number | null
          category: string
          city: string
          claimed_at: string | null
          country: string
          created_at: string | null
          description: string
          generation_metadata: Json | null
          id: string
          illustration_url: string
          imagine_task_id: string | null
          lat: number
          lng: number
          location_name: string | null
          original_image_url: string
          owner_id: string | null
          rarity: string | null
          should_animate: boolean | null
          streetview_pov: Json | null
          video_generation_status:
            | Database["public"]["Enums"]["video_generation_status_enum"]
            | null
          video_url: string | null
          visual_tags: Json | null
        }[]
        SetofOptions: {
          from: "*"
          to: "postalpeek_postcards"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      postalpeek_get_random_place: {
        Args: never
        Returns: {
          id: string
          latitude: number
          longitude: number
          name: string
        }[]
      }
      postalpeek_get_smart_albums: {
        Args: { p_user_id: string }
        Returns: Database["public"]["CompositeTypes"]["postalpeek_smart_album_list"][]
        SetofOptions: {
          from: "*"
          to: "postalpeek_smart_album_list"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      postalpeek_get_user_collection: {
        Args: { p_user_id: string }
        Returns: {
          album_id: string | null
          album_sequence: number | null
          category: string
          city: string
          claimed_at: string | null
          country: string
          created_at: string | null
          description: string
          generation_metadata: Json | null
          id: string
          illustration_url: string
          imagine_task_id: string | null
          lat: number
          lng: number
          location_name: string | null
          original_image_url: string
          owner_id: string | null
          rarity: string | null
          should_animate: boolean | null
          streetview_pov: Json | null
          video_generation_status:
            | Database["public"]["Enums"]["video_generation_status_enum"]
            | null
          video_url: string | null
          visual_tags: Json | null
        }[]
        SetofOptions: {
          from: "*"
          to: "postalpeek_postcards"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      postalpeek_match_postcard_albums: {
        Args: { p_postcard_id: string }
        Returns: Json
      }
      postalpeek_open_daily_pack: { Args: never; Returns: Json }
      postalpeek_remove_from_pack: {
        Args: { p_postcard_id: string }
        Returns: undefined
      }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      refresh_postalpeek_feed_cache: { Args: never; Returns: undefined }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      Difficulty: "EASY" | "MEDIUM" | "HARD"
      RelationType: "SEQUENTIAL" | "SIMILAR" | "COMPLEMENTARY"
      video_generation_status_enum:
        | "idle"
        | "processing"
        | "completed"
        | "failed"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      postalpeek_smart_album_list: {
        album_type: string | null
        filter_value: string | null
        title: string | null
        postcard_count: number | null
        cover_urls: string[] | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      Difficulty: ["EASY", "MEDIUM", "HARD"],
      RelationType: ["SEQUENTIAL", "SIMILAR", "COMPLEMENTARY"],
      video_generation_status_enum: [
        "idle",
        "processing",
        "completed",
        "failed",
      ],
    },
  },
} as const

