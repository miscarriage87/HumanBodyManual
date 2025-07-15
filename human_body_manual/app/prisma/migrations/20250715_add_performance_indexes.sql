-- Performance optimization indexes for progress tracking

-- User progress table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_user_completed 
ON user_progress(user_id, completed_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_user_body_area 
ON user_progress(user_id, body_area);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_user_exercise 
ON user_progress(user_id, exercise_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_completed_at 
ON user_progress(completed_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_body_area_completed 
ON user_progress(body_area, completed_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_exercise_completed 
ON user_progress(exercise_id, completed_at DESC);

-- User achievements table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_user_earned 
ON user_achievements(user_id, earned_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_achievement 
ON user_achievements(achievement_id);

-- User streaks table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_streaks_user_type 
ON user_streaks(user_id, streak_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_streaks_last_activity 
ON user_streaks(last_activity_date DESC);

-- User insights table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_insights_user_type 
ON user_insights(user_id, insight_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_insights_generated 
ON user_insights(generated_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_insights_user_generated 
ON user_insights(user_id, generated_at DESC);

-- Community challenges table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_community_challenges_active_dates 
ON community_challenges(is_active, start_date, end_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_community_challenges_dates 
ON community_challenges(start_date DESC, end_date DESC);

-- Challenge participants table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenge_participants_challenge_completed 
ON challenge_participants(challenge_id, completed);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenge_participants_user_joined 
ON challenge_participants(user_id, joined_at DESC);

-- Community stats table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_community_stats_type_date 
ON community_stats(stat_type, date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_community_stats_generated 
ON community_stats(generated_at DESC);

-- Achievements table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_achievements_category 
ON achievements(category);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_achievements_rarity 
ON achievements(rarity);

-- Community achievements table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_community_achievements_active 
ON community_achievements(is_active);

-- User community achievements table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_community_achievements_user_earned 
ON user_community_achievements(user_id, earned_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_user_area_completed 
ON user_progress(user_id, body_area, completed_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_user_completed_duration 
ON user_progress(user_id, completed_at DESC, duration_minutes);

-- Partial indexes for active records
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_community_challenges_active 
ON community_challenges(start_date, end_date) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenge_participants_active 
ON challenge_participants(challenge_id, user_id, progress) 
WHERE completed = false;

-- Indexes for aggregation queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_aggregation 
ON user_progress(user_id, body_area, completed_at, duration_minutes);

-- GIN indexes for JSONB columns (if using PostgreSQL features)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_biometric_gin 
ON user_progress USING GIN(biometric_data);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_achievements_criteria_gin 
ON achievements USING GIN(criteria);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_insights_content_gin 
ON user_insights USING GIN(content);

-- Text search indexes for session notes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_session_notes_text 
ON user_progress USING GIN(to_tsvector('english', session_notes));

-- Analyze tables to update statistics
ANALYZE user_progress;
ANALYZE user_achievements;
ANALYZE user_streaks;
ANALYZE user_insights;
ANALYZE community_challenges;
ANALYZE challenge_participants;
ANALYZE community_stats;
ANALYZE achievements;
ANALYZE community_achievements;
ANALYZE user_community_achievements;